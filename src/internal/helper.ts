export function isValidTagName(tagName: string): boolean {
    // 正则表达式，匹配有效的 HTML 标签名
    const tagRegex = /^[a-zA-Z][a-zA-Z0-9]*$/;

    // 使用正则表达式进行匹配
    return tagRegex.test(tagName);
}

// Helper function to compare arrays
export function arraysEqual<T>(a: T[], b: T[]): boolean {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

// Helper function to compare objects
export function objectsEqual(a: Record<string, any>, b: Record<string, any>): boolean {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
        return false;
    }

    for (const key of keysA) {
        if (a[key] !== b[key]) {
            return false;
        }
    }

    return true;
}