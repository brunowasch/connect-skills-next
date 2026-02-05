export const PASSWORD_REQUIREMENTS = {
    minLength: 8,
    hasUpperCase: /[A-Z]/,
    hasLowerCase: /[a-z]/,
    hasNumber: /[0-9]/,
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\]/ 
};

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
        errors.push("password_min_length");
    }
    if (!PASSWORD_REQUIREMENTS.hasUpperCase.test(password)) {
        errors.push("password_uppercase");
    }
    if (!PASSWORD_REQUIREMENTS.hasLowerCase.test(password)) {
        errors.push("password_lowercase");
    }
    if (!PASSWORD_REQUIREMENTS.hasNumber.test(password)) {
        errors.push("password_number");
    }
    if (!PASSWORD_REQUIREMENTS.hasSpecialChar.test(password)) {
        errors.push("password_special");
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
