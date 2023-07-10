export default class EmptySlot {
  isFilled = false;
  isEmpty = true;
  index: number;
  value = null;
  
  constructor(index: number) {
    this.index = index;
  }
}
