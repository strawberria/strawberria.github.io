<script lang="ts">
    let customClass: string = "";
    let customHeaderClass: string = "";
    let customContentClass: string = "";
    export { customClass as class, customHeaderClass as headerClass, customContentClass as contentClass }
</script>

<div class={`flex flex-col items-center space-y-2 
    rounded-lg bg-slate-800
    p-3 pt-2
    ${customClass}`}>
    <div class={`flex flex-row justify-center items-center
        w-full pl-4 pr-4 space-x-6
        ${customHeaderClass}`}>
        <slot name="header" />
    </div>
    <div class={`flex flex-col grow space-y-2 
        w-full p-1
        ${customContentClass}`}>
        <slot name="content" />
    </div>
</div>