import { sprintf } from "@std/fmt/printf";

export class CodeWriter {
    output = "";
    indent = 0;

    useTabs = false;
    indentSpaces = 4;

    protected reset(): void {
        this.output = "";
        this.indent = 0;
    }

    protected write(input: string): void {
        const indentString = (this.useTabs ? "\t" : " ".repeat(this.indentSpaces)).repeat(this.indent);
        this.output += sprintf("%s%s", indentString, input);
    }

    protected writeln(input: string): void {
        this.write(sprintf("%s\n", input));
    }

    protected newline(): void {
        this.output += "\n";
    }
}
