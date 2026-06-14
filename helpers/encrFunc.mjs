import crypto from 'crypto'


export function createToken(){
    return crypto.randomBytes(18).toString('hex');
}
export function rand(len){
    let str = "";
    for(let i=0;i<len;i++){
        str+=Math.floor(Math.random()*10).toString();
    }
    return str;
}
function genKey(key){
    let secret_key = crypto.createHash('sha512');
    secret_key = secret_key.update(key);
    secret_key = secret_key.digest('hex');
    secret_key = secret_key.substring(0, 32);
    let encryptionIV = crypto.createHash('sha512');
    encryptionIV = encryptionIV.update(key);
    encryptionIV = encryptionIV.digest('hex');
    encryptionIV = encryptionIV.substring(0, 16);
    return [secret_key,encryptionIV];
}



export function encrypt(plainText, key) {
    let keys = genKey(key);
    const cipher = crypto.createCipheriv("aes-256-cbc", keys[0], keys[1]);
    return Buffer.from(cipher.update(plainText, 'utf8', 'hex') + cipher.final('hex')).toString('base64')
}
export function decrypt(encryptText, key){
    const buff = Buffer.from(encryptText, 'base64');
    let keys = genKey(key);
    const decipher = crypto.createDecipheriv("aes-256-cbc",keys[0],keys[1]);
    return (
        decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
        decipher.final('utf8')
    )
}