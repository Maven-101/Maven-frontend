import CryptoJS from "crypto-js";

export function encryptVector(vector, secretKey) {
  console.log("Encrypting vector:", vector);
  console.log("Using secret key:", secretKey);
  const json = JSON.stringify(vector);
  return CryptoJS.AES.encrypt(json, secretKey).toString();
}

export function decryptVector(encrypted, secretKey) {
  const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}
