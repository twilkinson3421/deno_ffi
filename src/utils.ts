export function segments(input: string, separators: string[], trim = true): string[] {
    const output = [];

    for (const separator of separators) {
        const [before, ...after] = input.split(separator);
        if (before) output.push(trim ? before.trim() : before);
        if (after) input = trim ? after.join(separator).trim() : after.join(separator);
    }

    output.push(trim ? input.trim() : input);
    return output;
}
