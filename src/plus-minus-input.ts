const pmInput = (function () {

  // -------------------------------------------------------------------------------------------------------
  interface PlusMinusInputOptions {
    inputClass?: string;
    defaultValue?: number;
    minValue?: number;
    maxValue?: number;
    increment?: number;
    holdDelay?: number;
    incrementDelay?: number;
    minusContent?: string;
    plusContent?: string;
  }

  // -------------------------------------------------------------------------------------------------------
  class PlusMinusInput {

    private holdTimerId: NodeJS.Timer;
    private incrementTimerId: NodeJS.Timer;
    private wrapper: HTMLElement;
    private minusBtn: HTMLElement;
    private plusBtn: HTMLElement;

    constructor(
      private inputElement: HTMLInputElement,
      private inputClass: string,
      private defaultValue: number = 1,
      private minValue: number,
      private maxValue: number,
      private increment: number,
      private holdDelay: number,
      private incrementDelay: number,
      private minusContent: string,
      private plusContent: string,
    ) {

    }

    init(): void {
      if (this.minValue > this.maxValue) this.minValue = this.maxValue;
      if (this.defaultValue < this.minValue) this.defaultValue = this.minValue;
      if (this.defaultValue > this.maxValue) this.defaultValue = this.maxValue;
      this.render().setInputValue(this.defaultValue).setupEventListeners();
    }

    render(): PlusMinusInput {
      this.wrapper = document.createElement("div");
      this.plusBtn = document.createElement("span");
      this.minusBtn = document.createElement("span");
      const parent: Node = this.inputElement.parentNode;

      this.wrapper.className = this.inputClass;
      this.minusBtn.className = this.inputClass + "__minus";
      this.minusBtn.innerHTML = this.minusContent;
      this.plusBtn.className = this.inputClass + "__plus";
      this.plusBtn.innerHTML = this.plusContent;
      this.inputElement.className = this.inputClass + "__field";
      this.wrapper.appendChild(this.minusBtn);
      this.wrapper.appendChild(this.inputElement);
      this.wrapper.appendChild(this.plusBtn);
      parent.appendChild(this.wrapper);
      return this;
    }

    setInputValue(value: number | string): PlusMinusInput {
      value = (typeof value == "string") ? value : value.toString();
      this.inputElement.value = value;
      this.inputElement.setAttribute("value", value);
      return this;
    }

    setupEventListeners(): PlusMinusInput {
      this.minusBtn.addEventListener("click", event => this.minusOnClick(event));
      this.minusBtn.addEventListener("mousedown", event => this.minusOnMousedown(event));
      this.minusBtn.addEventListener("mouseup", () => this.clearTimers());
      this.minusBtn.addEventListener("mouseout", () => this.clearTimers());
      this.plusBtn.addEventListener("click", event => this.plusOnClick(event));
      this.plusBtn.addEventListener("mousedown", event => this.plusOnMousedown(event));
      this.plusBtn.addEventListener("mouseup", () => this.clearTimers());
      this.plusBtn.addEventListener("mouseout", () => this.clearTimers());
      this.inputElement.addEventListener("input", event => this.inputOnInput(event));
      return this;
    }

    minusOnClick(event: Event): void {
      let value: number = parseInt(this.inputElement.value);
      if (!isNaN(value)) {
        value = ((value - this.increment) > this.minValue) ? (value - this.increment) : this.minValue;
      }
      else {
        value = this.defaultValue;
      }
      this.setInputValue(value);
    }

    minusOnMousedown(event: Event): void {
      let value: number;
      let oldValue: number = parseInt(this.inputElement.value);
      let increment: number = this.increment;
      this.holdTimerId = setTimeout(() => {
        this.incrementTimerId = setInterval(() => {
          value = parseInt(this.inputElement.value);
          if ((value - increment) > this.minValue) {
            value -= increment;
            if ((oldValue - value) > (increment * 30)) {
              increment *= 11;
            }
          }
          else {
            value = this.minValue;
          }
          this.setInputValue(value);
        }, this.incrementDelay);
      }, this.holdDelay);
    }

    plusOnClick(event: Event): void {
      let value: number = parseInt(this.inputElement.value);
      if (!isNaN(value)) {
        value = ((value + this.increment) < this.maxValue) ? (value + this.increment) : this.maxValue;
      }
      else {
        value = this.defaultValue;
      }
      this.setInputValue(value);
    }

    plusOnMousedown(event: Event): void {
      let oldValue: number = parseInt(this.inputElement.value);
      let increment: number = this.increment;
      this.holdTimerId = setTimeout(() => {
        this.incrementTimerId = setInterval(() => {
          let value: number = parseInt(this.inputElement.value);
          if ((value + increment) < this.maxValue) {
            value += increment;
            if ((value - oldValue) > (increment * 30)) {
              increment *= 11;
            }
          }
          else {
            value = this.maxValue;
          }
          this.setInputValue(value);
        }, this.incrementDelay);
      }, this.holdDelay);
    }

    inputOnInput(event: Event): void {
      let value: number = parseInt(this.inputElement.value);
      if (!isNaN(value)) {
        if (value > this.maxValue) value = this.maxValue;
        if (value < this.minValue) value = this.minValue;
      }
      else {
        value = this.defaultValue;
      }
      this.setInputValue(value);
    }

    clearTimers(): void {
      if (this.incrementTimerId) { clearInterval(this.incrementTimerId); }
      if (this.holdTimerId) { clearTimeout(this.holdTimerId); }
    }
  }

  // -------------------------------------------------------------------------------------------------------
  return function plusMinusInputFactory(options: PlusMinusInputOptions): void {

    const {
      inputClass = "plus-minus-input",
      defaultValue = 1,
      minValue = 0,
      maxValue = 1000,
      increment = 1,
      holdDelay = 500,
      incrementDelay = 50,
      minusContent = "&minus;",
      plusContent = "&plus;"
    } = options;

    // let inputClass: string = options.inputClass || "plus-minus-input";
    // let defaultValue: number = options.defaultValue || 1;
    // let minValue: number = options.minValue || 0;
    // let maxValue: number = options.maxValue || 1000;
    // let increment: number = options.increment || 1;
    // let holdDelay: number = options.holdDelay || 500;
    // let incrementDelay: number = options.incrementDelay || 50;
    // let minusContent: string = options.minusContent || "&minus;";
    // let plusContent: string = options.plusContent || "&plus;";

    let elements: NodeListOf<HTMLInputElement>;

    try {
      elements = document.querySelectorAll("." + inputClass);
    }
    catch (error) {
      console.warn("PlusMinusInput >> Please enter a valid inputClass. " + error);
      return;
    }

    if (elements.length === 0) {
      console.warn("PlusMinusInput >> Your collection has 0 elements. Check your inputClass.");
      return;
    }

    if (defaultValue < minValue || defaultValue > maxValue) {
      console.warn("PlusMinusInput >> Default value of input must be more than minValue and less than maxValue");
    }

    if (minValue > maxValue) {
      console.warn("PlusMinusInput >> minValue of input must be less than maxValue");
    }

    for (let i = 0, len = elements.length; i < len; i++) {
      new PlusMinusInput(
        elements[i],
        inputClass,
        defaultValue,
        minValue,
        maxValue,
        increment,
        holdDelay,
        incrementDelay,
        minusContent,
        plusContent
      ).init();
    }
  }
  // -------------------------------------------------------------------------------------------------------

})();