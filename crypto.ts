import { Aes } from "https://deno.land/x/crypto/aes.ts";
import { Cbc, Padding } from "https://deno.land/x/crypto/block-modes.ts";

const filla = '1UJOIU--HHT"c-e3--&NJJSSSS0';
const fillTo15 = (s: string): string => s.length > 15 ? s.substring(0, 15) : fillTo15(s + filla.substring(s.length, s.length + 1));
const toBytes32 = (s: string) => {
    const key = fillTo15(s);
    const buf = key.padEnd(32, "\0");
    return buf;
}

const encrypt = (password: string, dataString: string) => {
    const te = new TextEncoder();
    const pw = toBytes32(password);
    const key = te.encode(pw);
    const data = te.encode(dataString);
    const iv = new Uint8Array(16);
    const cipher = new Cbc(Aes, key, iv, Padding.PKCS7);
    const encrypted = cipher.encrypt(data);
    return encrypted;
}

const decipher = (password: string, encrypted: Uint8Array) => {
    const te = new TextEncoder();
    const pw = toBytes32(password);
    const key = te.encode(pw);
    const iv = new Uint8Array(16);
    const decipher = new Cbc(Aes, key, iv, Padding.PKCS7);
    const decrypted = decipher.decrypt(encrypted);
    return new TextDecoder().decode(decrypted);
}

export { decipher, encrypt };
