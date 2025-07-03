<script lang="ts">
    import { Button, Checkbox, Flex, NativeSelect, NumberInput, Text, TextInput } from "@svelteuidev/core";
    import { afterUpdate } from "svelte";

    let chasterApiToken = "";
    let retrievingData = false;
    let retrievedData = true;
    let sharedLocksData: any = {};
    let sharedLocksSelectData: { label: string, value: string }[] = [];
    let selectedSharedLockID = "";

    async function retrieveSharedLocks() {
        retrievingData = true;
        const sharedLocksResponse = await fetch("https://api.chaster.app/shared-locks?status=active", {
            headers: { "accept": "application/json", "Authorization": `Bearer ${chasterApiToken}` }
        });
        const rawSharedLocksData = await sharedLocksResponse.json();
        for(const rawSharedLockData of rawSharedLocksData) {
            sharedLocksData[rawSharedLockData["_id"]] = rawSharedLockData["name"]
            sharedLocksSelectData.push({ label: rawSharedLockData["name"], value: rawSharedLockData["_id"] });
        }
        sharedLocksSelectData = sharedLocksSelectData;
        selectedSharedLockID = sharedLocksSelectData[0]["value"];
        retrievingData = false;
        retrievedData = true;
    }

    let checkedRandomChangeTime = false;
    let randomChangeTime_chance = 0;
    let randomChangeTime_minHours = -1;
    let randomChangeTime_maxHours = 1;
    let checkedRandomFreeze = false;
    let randomFreeze_chance = 0;
    let randomFreeze_action = "";
    let checkedSendPillory = false;
    let randomPillory_chance = 0;
    let randomPillory_durationHours = 0.25;
    let randomPillory_message = "naughty naughty~";
    let checkedUnlockWearer = false;
    let randomUnlockWearer_chance = 0;
    let randomUnlockWearer_check = "";

    let logMessages: string[] = [];
    function addLogMessage(text: string) {
        logMessages.push(text);
        logMessages = logMessages;
    }

    function getRandomArbitrary(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    let executing = false;
    async function handleExecute() {
        executing = true;
        logMessages = [];

        if(checkedUnlockWearer && randomUnlockWearer_check != sharedLocksData[selectedSharedLockID]) {
            addLogMessage("/!\\ Please out the unlock confirmation message first!");
            executing = false;

            return;
        }

        addLogMessage("Retrieving matching locks...")

        // Retrieve a list of locks running the given lock
        const locksRunningSharedLock = [];
        for(let page = 0; page < 999; page++) {
            const matchingLocksResponse = await fetch("https://api.chaster.app/keyholder/locks/search", {
                headers: { "content-type": "application/json", "accept": "application/json", "Authorization": `Bearer ${chasterApiToken}` },
                method: "POST",
                body: JSON.stringify({ criteria: { sharedLocks: { sharedLockIds: [selectedSharedLockID] } }, status: "locked", page: page, limit: 50 })
            });
            const matchingLocksJSON = await matchingLocksResponse.json();
            console.log(matchingLocksJSON)
            locksRunningSharedLock.push(...matchingLocksJSON["locks"]);
            if(matchingLocksJSON["pages"] == page + 1) {
                break;
            }
        }

        addLogMessage(`- Found ${locksRunningSharedLock.length} lock(s) currently running`);
        addLogMessage("Processing selected random actions...")
        addLogMessage("================================================================")

        // Iterate over each lock and do the random chance thing
        for(const lockData of locksRunningSharedLock) {
            const shouldTime = Math.random() < randomChangeTime_chance * 100;
            const shouldFreeze = Math.random() < randomFreeze_chance * 100;
            const shouldPillory = Math.random() < randomPillory_chance * 100;
            const shouldUnlock = Math.random() < randomUnlockWearer_chance * 100;
            if(!shouldTime && !shouldFreeze && !shouldPillory && !shouldUnlock) { continue; }

            addLogMessage(`${lockData["_id"]} / ${lockData["user"]["username"]}`)

            if(shouldUnlock) {
                addLogMessage(`- Unlocking their lock, lucky for them!`);

                // Unlock the wearer from the lock
                await fetch(`https://api.chaster.app/locks/${lockData["_id"]}/unlock`, {
                    headers: { "content-type": "application/json", "accept": "application/json", "Authorization": `Bearer ${chasterApiToken}` },
                    method: "POST",
                });

                continue;
            }

            if(shouldTime) {
                let randomHours = getRandomArbitrary(randomChangeTime_minHours, randomChangeTime_maxHours);
                const randomSeconds = Math.floor(randomHours * 60 * 60);

                // For timestamp purposes
                const randomHoursDisp = Math.floor(Math.abs(randomSeconds / 3600));
                const randomMinutes = Math.floor(Math.abs(randomSeconds) / 60) % 60;
                const randomSecondsDisp = Math.abs(randomSeconds) % 60;
                const timestamp = [randomHoursDisp, randomMinutes, randomSecondsDisp]
                    .map(v => v < 10 ? "0" + v : v)
                    .join(":");
                addLogMessage(`- Changing their lock time by ${randomHours < 0 ? "-" : ""}${timestamp} (${randomSeconds} seconds)`);

                // Execute the time update thing
                await fetch(`https://api.chaster.app/locks/${lockData["_id"]}/update-time`, {
                    headers: { "content-type": "application/json", "accept": "application/json", "Authorization": `Bearer ${chasterApiToken}` },
                    method: "POST",
                    body: JSON.stringify({ duration: randomSeconds })
                });
            }

            if(shouldFreeze) {
                const freezeValue = randomFreeze_action === "freeze"
                    ? true : randomFreeze_action === "unfreeze"
                    ? false : !lockData["isFrozen"];
                const previousFreeze = lockData["isFrozen"] ? "frozen" : "not frozen";
                const currentFreeze = freezeValue ? "frozen" : "not frozen";

                addLogMessage(`- ${randomFreeze_action === "freeze" ? "Freezing" : randomFreeze_action === "unfreeze" ? "Unfreezing" : "Toggling freeze"}`
                    + ` on their lock (${previousFreeze} -> ${currentFreeze})`);

                // Execute the lock freeze thing
                await fetch(`https://api.chaster.app/locks/${lockData["_id"]}/freeze`, {
                    headers: { "content-type": "application/json", "accept": "application/json", "Authorization": `Bearer ${chasterApiToken}` },
                    method: "POST",
                    body: JSON.stringify({ isFrozen: freezeValue })
                });
            }

            if(shouldPillory) {
                // Check whether the given lock has pillory enabled
                const pilloryExtensionsData = lockData["extensions"].filter((d: any) => d["slug"] == "pillory");
                addLogMessage("- Sending the given lock to the pillory");
                
                if(pilloryExtensionsData.length === 0) {
                    addLogMessage("/!\\ Pillory not enabled for this lock, skipping");
                } else {
                    const pilloryExtensionID = pilloryExtensionsData[0]["_id"];

                    // Execute the pillory thing
                    const pilloryResponse = await fetch(`https://api.chaster.app/locks/${lockData["_id"]}/extensions/${pilloryExtensionID}/action`, {
                        headers: { "content-type": "application/json", "accept": "application/json", "Authorization": `Bearer ${chasterApiToken}` },
                        method: "POST",
                        body: JSON.stringify({ action: "submit", payload: { duration: Math.floor(randomPillory_durationHours * 60 * 60), reason: randomPillory_message } })
                    });
                    if(pilloryResponse.status === 400) {
                        addLogMessage("  /!\\ Pillory failed because user is currently inactive")
                    }
                }
            }
        }

        executing = false;
    }

    let consoleElement: HTMLElement
    function attemptScroll() {
        if(consoleElement && consoleElement.scrollHeight - consoleElement.clientHeight - consoleElement.scrollTop < 50) {
            consoleElement.scroll({ top: consoleElement.scrollHeight, behavior: 'instant' })
        }
    }
    $: { attemptScroll() }
    afterUpdate(() => { attemptScroll() });
</script>

<Flex direction="column" class="absolute inset-0 mx-[1em] my-[0.5em]">
    <Flex direction="row" class="w-full h-full space-x-[1.5em]">
        <Flex direction="column" class="h-full space-y-[1em]">
            <Flex direction="row" class="w-full space-x-[1em] items-center">
                <TextInput class="w-[20em]" 
                    label="Chaster API Token"
                    placeholder=""
                    required={true}
                    error={chasterApiToken.length == 0}
                    bind:value={chasterApiToken} />
                <Flex direction="column" class="space-y-[0.5em]">
                    <Button size="xs" disabled={retrievingData || chasterApiToken == ""}
                        on:click={retrieveSharedLocks}>
                        Retrieve Data
                    </Button>
                    <Button size="xs" disabled={(!checkedRandomChangeTime && !checkedRandomFreeze && !checkedSendPillory && !checkedUnlockWearer && retrievedData) || executing}
                        on:click={handleExecute}>
                        Execute Actions
                    </Button>
                </Flex>
            </Flex>
            <NativeSelect label="Select Shared Lock (to perform actions on for every locked user)"
                disabled={!retrievedData}
                data={sharedLocksSelectData}
                bind:value={selectedSharedLockID} />
            <Flex direction="column" class="w-full border-gray-400 border-t pt-[0.5em] space-y-[0.25em]">
                <Text size="sm">Add or remove time from lock</Text>
                <Flex direction="row" class="w-full space-x-[1em] items-center">
                    <Checkbox bind:checked={checkedRandomChangeTime} disabled={!retrievedData}/>
                    <NumberInput class={"w-[8em] " + (checkedRandomChangeTime ? "" : "invisible")} 
                        label="Chance (0-100)" error={randomChangeTime_chance < 0 || randomChangeTime_chance > 100}
                        bind:value={randomChangeTime_chance}/>
                    <NumberInput class={"w-[8em] " + (checkedRandomChangeTime ? "" : "invisible")} 
                        label="Min Hours"
                        bind:value={randomChangeTime_minHours}/>
                    <NumberInput class={"w-[8em] " + (checkedRandomChangeTime ? "" : "invisible")} 
                        label="Max Hours"
                        bind:value={randomChangeTime_maxHours}/>
                </Flex>
            </Flex>
            <Flex direction="column" class="w-full border-gray-400 border-t pt-[0.5em] space-y-[0.25em]">
                <Text size="sm">Freeze, unfreeze, or toggle freeze on lock</Text>
                <Flex direction="row" class="w-full space-x-[1em] items-center">
                    <Checkbox bind:checked={checkedRandomFreeze} disabled={!retrievedData}/>
                    <NumberInput class={"w-[8em] " + (checkedRandomFreeze ? "" : "invisible")} 
                        label="Chance (0-100)" error={randomFreeze_chance < 0 || randomFreeze_chance > 100}
                        bind:value={randomFreeze_chance}/>
                    <NativeSelect class={"w-[17em] " + (checkedRandomFreeze ? "" : "invisible")} 
                        label="Action to take"
                        disabled={!retrievedData}
                        data={[
                            { "label": "Freeze", value: "freeze" }, 
                            { "label": "Unfreeze", value: "unfreeze" },
                            { "label": "Toggle Freeze", value: "toggle" },
                        ]}
                        bind:value={randomFreeze_action} />
                </Flex>
            </Flex>
            <Flex direction="column" class="w-full border-gray-400 border-t pt-[0.5em] space-y-[0.25em]">
                <Text size="sm">Send lock to pillory (extension must be enabled)</Text>
                <Flex direction="row" class="w-full space-x-[1em] items-center">
                    <Checkbox bind:checked={checkedSendPillory} disabled={!retrievedData}/>
                    <NumberInput class={"w-[8em] " + (checkedSendPillory ? "" : "invisible")} 
                        label="Chance (0-100)" error={randomPillory_chance < 0 || randomPillory_chance > 100}
                        bind:value={randomPillory_chance}/>
                    <NumberInput class={"w-[6em] " + (checkedSendPillory ? "" : "invisible")} 
                        label="Hours" error={randomPillory_durationHours < 0.25}
                        bind:value={randomPillory_durationHours}/>
                    <TextInput class={"w-[10em] " + (checkedSendPillory ? "" : "invisible")} 
                        label="Pillory Message"
                        bind:value={randomPillory_message}/>
                </Flex>
            </Flex>
            <Flex direction="column" class="w-full border-gray-400 border-t pt-[0.5em] space-y-[0.25em]">
                <Text size="sm">Unlock wearer from lock</Text>
                <Flex direction="row" class="w-full space-x-[1em] items-center">
                    <Checkbox bind:checked={checkedUnlockWearer} disabled={!retrievedData}/>
                    <NumberInput class={"w-[8em] " + (checkedUnlockWearer ? "" : "invisible")} 
                        label="Chance (0-100)" error={randomUnlockWearer_chance < 0 || randomUnlockWearer_chance > 100}
                        bind:value={randomUnlockWearer_chance}/>
                    <TextInput class={"w-[17em] " + (checkedUnlockWearer ? "" : "invisible")} 
                        label="Type out the lock name for confirmation"
                        placeholder={sharedLocksData[selectedSharedLockID]}
                        bind:value={randomUnlockWearer_check}/>
                </Flex>
            </Flex>
        </Flex>
        <div class="flex flex-col max-h-full bg-[#24252a] p-[0.5em] w-[48em] rounded-md overflow-auto"
            style="font-family: 'Courier New', Courier, monospace"
            bind:this={consoleElement}>
            {#each logMessages as logMessage}
                <div class="text-sm">{logMessage}</div>
            {/each}
        </div>
    </Flex>
</Flex>