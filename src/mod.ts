import { sprintf } from "@std/fmt/printf";
import type * as Symbol from "./symbol.ts";
import * as Writer from "./writer.ts";

export * as Symbol from "./symbol.ts";
export * as Types from "./types.ts";

export class InterfaceWriter extends Writer.CodeWriter {
    public override reset(): void {
        super.reset();
    }

    begin(config: InterfaceWriter.Config): void {
        this.writeln(sprintf('import * as Types from "%s";', config.typesImportSource));
        this.newline();
        this.writeln("export const symbols = {");
        this.indent++;
    }

    end(): void {
        this.indent--;
        this.writeln("} as const satisfies Deno.ForeignLibraryInterface;");
    }

    writeSymbol(symbol: Symbol.Signature): void {
        if (symbol.docstring !== null) this.writeln(sprintf("/** %s */", symbol.docstring));

        this.writeln(sprintf("%s: {", symbol.libName));
        this.indent++;

        this.writeln(sprintf('name: "%s",', symbol.cName));

        const parameters: string[] = [];
        const parameterAssertion: string[] = [];

        for (const { type, cName } of symbol.parameters) {
            parameters.push(sprintf("%s", type.nativeType));

            if (cName === null) {
                parameterAssertion.push(sprintf("%s", type.nativeType));
                continue;
            }

            if (type.nativeType.startsWith('"')) {
                parameterAssertion.push(sprintf("%s: %s", cName, type.nativeType));
                continue;
            }

            parameterAssertion.push(sprintf("%s: typeof %s", cName, type.nativeType));
        }

        this.writeln(sprintf("parameters: [%s] as [%s],", parameters.join(","), parameterAssertion.join(", ")));

        this.writeln(sprintf("result: %s, // %s", symbol.returnType.nativeType, symbol.returnType.cType));
        this.writeln(sprintf("optional: %t,", symbol.isOptional));
        this.writeln(sprintf("nonblocking: %t", symbol.isNonblocking));

        this.indent--;
        this.writeln("},");
        this.newline();
    }
}

export namespace InterfaceWriter
{
    export type Config = {
        typesImportSource: string;
    };
}
