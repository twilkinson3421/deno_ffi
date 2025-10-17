import { sprintf } from "@std/fmt/printf";
import * as Types from "./types.ts";
import * as Utils from "./utils.ts";

export type Signature = {
    libName: string;
    cName: string;
    parameters: { type: Types.ParseResult; cName: string | null }[];
    returnType: Types.ParseResult;
    isOptional: boolean;
    isNonblocking: boolean;
    docstring: string | null;
};

const OPTIONAL_CANDIDATE = "--optional" as const;
const NONBLOCKING_CANDIDATE = "--nonblocking" as const;
const PARAMS_START = "(" as const;
const PARAMS_END = ")" as const;
const DOCSTRING_START = "//" as const;
const PARAM_SEPARATOR = "," as const;

export type Config = {
    stripPrefix: boolean;
};

const DEFAULT_CONFIG: Config = { stripPrefix: false };

export function parse(input: string, config: Config = DEFAULT_CONFIG): Signature {
    input = input.trim();

    const isOptional = input.startsWith(OPTIONAL_CANDIDATE);
    if (isOptional) input = input.slice(OPTIONAL_CANDIDATE.length).trim();
    const isNonblocking = input.startsWith(NONBLOCKING_CANDIDATE);
    if (isNonblocking) input = input.slice(NONBLOCKING_CANDIDATE.length).trim();

    const segments = Utils.segments(input, [PARAMS_START, PARAMS_END, DOCSTRING_START]);

    const functionDeclaration = segments[0]?.trim();
    if (functionDeclaration === undefined) throw new Error(sprintf("Invalid symbol: %s", input));

    let { cType: cReturnType, cName } = Types.split(functionDeclaration);
    if (cName === null) throw new Error(sprintf("Unnamed symbols are not supported: %s", input));
    if (config.stripPrefix && cName.includes("_")) cName = cName.slice(cName.indexOf("_") + 1);

    const returnType = Types.parse(cReturnType);
    const libName = cName.charAt(0).toLowerCase() + cName.slice(1);

    const parameters = segments[1]?.trim().split(PARAM_SEPARATOR).map((param) => {
        const { cType, cName } = Types.split(param);
        return cType === "void" ? null : { type: Types.parse(cType), cName };
    }).filter((param) => param !== null) ?? [];

    const docstring = segments.at(-1)?.trim() ?? null;

    return { libName, cName, parameters, returnType, isOptional, isNonblocking, docstring };
}
