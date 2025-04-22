
import {z} from "zod"

const XSS_REGEX = /<script.*?>.*?<\/script>|onerror\s*=|onload\s*=|javascript:/gi;
const SQL_INJECTION_REGEX = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC)\b)|('|--|;)/gi;

export async function isMaliciousInput(input: string): Promise<boolean> {
  // Check for basic XSS patterns
  if (XSS_REGEX.test(input)) return true;
  
  // Check for SQL injection patterns
  if (SQL_INJECTION_REGEX.test(input)) return true;
  
  // Check for unusual encoding
  try {
    const decoded = decodeURIComponent(input);
    if (decoded !== input) return true;
  } catch {}
  
  // Check for excessive length
  if (input.length > 500) return true;
  
  return false;
}


export const loginSchema =z.object({
  mobile:z.string().min(8,"لابد ان يكون 9 ارقام").max(10,"لابد ان يكون 9 ارقام"),
  password:z.string().min(6)
})

export const signUpSchema =z.object({
    mobile:z.string().min(8,"لابد ان يكون 9 ارقام").max(10,"لابد ان يكون 9 ارقام"),
    password:z.string().min(6,"كلمه المرور لابد ان تكون اكثر من 5 حروف او ارقام"),
    name:z.string().min(10,"الاسم لابد ان يكون اكثر من 10 حروف").max(140),
    otp:z.string().optional()
})