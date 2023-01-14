export default function checkTextLength(text: string): undefined | never {
  const error = new Error();

  if (!text.length) {
    error.message = "Нельзя прислать пустое сообщение";
  } else if (text.length >= 128) {
    error.message = "Длинна сообщения превышает 128";
  } else return;
  
  throw error;
}
