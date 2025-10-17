import { sprintf } from "@std/fmt/printf";

export enum NativeType
{
    I8 = "i8",
    I16 = "i16",
    I32 = "i32",
    I64 = "i64",
    ISize = "isize",

    U8 = "u8",
    U16 = "u16",
    U32 = "u32",
    U64 = "u64",
    USize = "usize",

    F32 = "f32",
    F64 = "f64",

    Bool = "bool",
    Void = "void",

    Buffer = "buffer",
    Function = "function",
    Pointer = "pointer",
}

export const map: Map<string, NativeType> = new Map([
    // Primary types

    ["void", NativeType.Void],

    ["bool", NativeType.Bool],

    ["char", NativeType.I8],
    ["signed char", NativeType.I8],
    ["unsigned char", NativeType.U8],

    ["short", NativeType.I16],
    ["short int", NativeType.I16],
    ["signed short", NativeType.I16],
    ["signed short int", NativeType.I16],

    ["unsigned short", NativeType.U16],
    ["unsigned short int", NativeType.U16],

    ["int", NativeType.I32],
    ["signed", NativeType.I32],
    ["signed int", NativeType.I32],

    ["unsigned", NativeType.U32],
    ["unsigned int", NativeType.U32],

    ["long", NativeType.I32],
    ["long int", NativeType.I32],
    ["signed long", NativeType.I32],
    ["signed long int", NativeType.I32],

    ["unsigned long", NativeType.U32],
    ["unsigned long int", NativeType.U32],

    ["long long", NativeType.I64],
    ["long long int", NativeType.I64],
    ["signed long long", NativeType.I64],
    ["signed long long int", NativeType.I64],

    ["unsigned long long", NativeType.U64],
    ["unsigned long long int", NativeType.U64],

    ["float", NativeType.F32],
    ["double", NativeType.F64],

    // C99 Fixed-width integer types

    ["int8_t", NativeType.I8],
    ["int16_t", NativeType.I16],
    ["int32_t", NativeType.I32],
    ["int64_t", NativeType.I64],
    ["int_least8_t", NativeType.I8],
    ["int_least16_t", NativeType.I16],
    ["int_least32_t", NativeType.I32],
    ["int_least64_t", NativeType.I64],
    ["int_fast8_t", NativeType.I8],
    ["int_fast16_t", NativeType.I16],
    ["int_fast32_t", NativeType.I32],
    ["int_fast64_t", NativeType.I64],
    ["intptr_t", NativeType.I64],
    ["intmax_t", NativeType.I64],

    ["uint8_t", NativeType.U8],
    ["uint16_t", NativeType.U16],
    ["uint32_t", NativeType.U32],
    ["uint64_t", NativeType.U64],
    ["uint_least8_t", NativeType.U8],
    ["uint_least16_t", NativeType.U16],
    ["uint_least32_t", NativeType.U32],
    ["uint_least64_t", NativeType.U64],
    ["uint_fast8_t", NativeType.U8],
    ["uint_fast16_t", NativeType.U16],
    ["uint_fast32_t", NativeType.U32],
    ["uint_fast64_t", NativeType.U64],
    ["uintptr_t", NativeType.U64],
    ["uintmax_t", NativeType.U64],

    ["wchar_t", NativeType.U16],
    ["char16_t", NativeType.U16],
    ["char32_t", NativeType.U32],

    ["size_t", NativeType.USize],
    ["ssize_t", NativeType.ISize],
    ["ptrdiff_t", NativeType.ISize],

    // Buffers

    ["char *", NativeType.Buffer],
    ["char[]", NativeType.Buffer],
    ["signed char *", NativeType.Buffer],
    ["signed char[]", NativeType.Buffer],
    ["unsigned char *", NativeType.Buffer],
    ["unsigned char[]", NativeType.Buffer],
    ["wchar_t *", NativeType.Buffer],
    ["wchar_t[]", NativeType.Buffer],
    ["char16_t *", NativeType.Buffer],
    ["char16_t[]", NativeType.Buffer],
    ["char32_t *", NativeType.Buffer],
    ["char32_t[]", NativeType.Buffer],
]);

export const QUALIFIERS = ["const", "volatile", "restrict"] as const;

export const PTR_CANDIDATE = "*" as const;
export const FUNCTION_PTR_CANDIDATE = "(*" as const;
export const FUNCTION_PTR_PTR_CANDIDATE = "(**" as const;
export const VARIADIC_CANDIDATE = "..." as const;

export type ParseResult = {
    cType: string;
    nativeType: string;
};

export function parse(cType: string): ParseResult {
    cType = cType.trim();

    if (cType.includes(VARIADIC_CANDIDATE)) {
        const fmt = "Variadic types are not supported: %s";
        throw new Error(sprintf(fmt, cType));
    }

    let localType = cType;

    {
        let qualifierWasFound = false;
        do {
            for (const qualifier of QUALIFIERS) {
                if (localType.startsWith(qualifier)) {
                    localType = localType.slice(qualifier.length).trim();
                    qualifierWasFound = true;
                } else qualifierWasFound = false;
            }
        } while (qualifierWasFound);
    }

    const nativeTypeFromMap = map.get(localType);
    if (nativeTypeFromMap !== undefined) return { cType, nativeType: sprintf('"%s"', nativeTypeFromMap) };

    const isFunctionPtrPtr = localType.includes(FUNCTION_PTR_PTR_CANDIDATE);
    if (isFunctionPtrPtr) return { cType, nativeType: sprintf('"%s"', NativeType.Pointer) };

    const isFunctionPtr = localType.includes(FUNCTION_PTR_CANDIDATE);
    if (isFunctionPtr) return { cType, nativeType: sprintf('"%s"', NativeType.Function) };

    const isPointer = localType.includes(PTR_CANDIDATE);
    if (isPointer) return { cType, nativeType: sprintf('"%s"', NativeType.Pointer) };

    return { cType, nativeType: sprintf("Types.%s", localType) };
}

export type SplitResult = {
    cType: string;
    cName: string | null;
};

const SPLIT_CANDIDATES = [" ", "*"];

export function split(input: string): SplitResult {
    input = input.trim();
    const lastIndex = input.length - 1;
    const sliceIndex = lastIndex - input.split("").toReversed().findIndex((char) => SPLIT_CANDIDATES.includes(char));
    const cType = ~sliceIndex ? input.slice(0, sliceIndex + 1).trim() : input;
    const name = ~sliceIndex ? input.slice(sliceIndex + 1).trim() : null;
    return { cType, cName: name };
}
