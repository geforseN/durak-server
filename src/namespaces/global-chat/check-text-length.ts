export default function checkTextLength(text: string): void | never {
  if (!text.length) {
    throw new Error("Нельзя прислать пустое сообщение");
  }
  if (text.length >= 128) {
    throw new Error("Длинна сообщения превышает 128");
  }
}
