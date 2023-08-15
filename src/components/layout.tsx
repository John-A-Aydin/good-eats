import type { PropsWithChildren } from "react";

export const PageLayout= (props: PropsWithChildren) => {
    return (
        <main className="flex h-screen justify-center">
            {/* {overflow-y-scroll} */}
            <div className="h-full w-full border-x border-neutral-600 md:max-w-2xl">
                {props.children}
            </div>
        </main>
    );
};