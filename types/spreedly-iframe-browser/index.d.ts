/**
 * Spreedly ThreeDS Lifecycle object is used to help simplify your frontend integration with Spreedly 3DS2 Solutions.
 *
 * The Lifecycle object polls the Spreedly backend and emits events when the transaction changes status or times out. When a 3DS Challenge needs to be displayed to a cardholder, it will create an <iframe> element and inject it with the <form> from the acquiring bank.
 */
declare class SpreedlyThreeDSLifecycle {
  constructor(lifecycleParameters: {
    /** The key of the Spreedly environment where the payment method should be tokenized. */
    environmentKey?: string;

    /** The DOM node that you’d like to inject hidden iframes. */
    hiddenIframeLocation: string;

    /** The DOM node that you'd like to inject the challenge flow/ */
    challengeIframeLocation: string;

    /** The token for the transaction - used to poll for state/ */
    transactionToken: string;

    /** The css classes that you'd like to apply to the challenge iframe. */
    challengeIframeClasses?: string;
  });

  /** Starts Spreedly’s 3DSecure asynchronous flow once it is completely setup using the new constructor. */
  start(): void;
}

declare enum SpreedlyThreeDSAction {
  /** Transaction has finished and it’s time to move your user away from your checkout page. */
  succeeded = 'succeeded',
  /** There was an error with the transaction and you should either present an error to the user or cancel the transaction. Transactions that have failed cannot be updated or used to challenge the cardholder again; if you would like to present a cardholder with a new challenge upon failure, a new transaction should be used. The event has a response hash that contains information on the transaction state, message, and error_code if available. */
  error = 'error',
  /** It’s time to pop open the challenge flow, see our [integration guides](https://docs.spreedly.com/guides/3dsecure-landing/). */
  challenge = 'challenge',
  /** Customer authentication could not be completed within the expected window. This gets triggered 10-15 minutes after presenting a challenge without the transaction state changing. It is recommended that merchants attempt a manual completion here to attempt to continue or finalize the transaction. */
  finalizationTimeout = 'finalization-timeout',
  /** Make the authenticated transaction completion call from your backend to Spreedly and call event.finalize` with the response data in your frontend. */
  triggerCompletion = 'trigger-completion',
}

declare enum SpreedlyFieldEventType {
  /** An iFrame field has lost focus. Note that on iOS devices this event does not consistently trigger. As a workaround, we have seen some customers use the mouseout event in place of blur when iFrame is used in Safari or a WKWebview on iOS. */
  blur = 'blur',
  /** The user has pressed “enter” while in an iFrame field. */
  enter = 'enter',
  /** The user has pressed “escape” while in an iFrame field. */
  escape = 'escape',
  /** An iFrame field has gained focus. */
  focus = 'focus',
  /** The user has entered a new input value into an iFrame field. */
  input = 'input',
  /** The cursor has moved onto an iFrame field. */
  mouseover = 'mouseover',
  /** The cursor has left an iFrame field. */
  mouseout = 'mouseout',
  /** The user has pressed the “shift+tab” key combo while in an iFrame field. */
  shiftTab = 'shiftTab',
  /** The user has pressed “tab” while in an iFrame field. */
  tab = 'tab',
}

type SpreedlyInputProperties = {
  /** The type (brand) of the card. One of supported card identifiers. */
  cardType: string;
  /** This will check if the supplied card number is a supported brand and expected length. If the brand has an algorithm check, it validates that the algorithm passes.  */
  validNumber: boolean;
  /** This will check if the supplied CVV matches the expected length based on the card type, and is comprised of only numbers. */
  validCvv: boolean;
  /** The length of the value entered into the number field. */
  numberLength: number;
  /** The length of the value entered into the CVV field. */
  cvvLength: number;
};

declare class SpreedlyPaymentFrame {
  //#region Lifecycle

  /**
   * Create a new, independent, instance of the iFrame. It will be created alongside the default instance, already exposed as Spreedly.
   *
   * Only instantiate a new instance of the iFrame if you want to use multiple payment forms on the same host page. Otherwise, use the default Spreedly instance that is automatically created on the page.
   */
  constructor();

  cvvFrameId: string;
  cvvTarget: string;
  environmentKey?: string;
  numberFrameId: string;
  numberTarget: string;
  uniqueId: string;

  /** Initialize the iFrame library. This must be the first call made to iFrame and will trigger the loading of the iFrame fields. */
  init(
    /** The key of the Spreedly environment where the payment method should be tokenized.  */
    environmentKey: string,
    /** Map of initialization options. */
    options: {
      /** The id of the HTML element where the number iFrame field should be rendered.  */
      numberEl: string;
      /** The id of the HTML element where the CVV iFrame field should be rendered. */
      cvvEl: string;
    }
  ): void;

  /**
   * Reload the iFrame library. This resets and re-initializes all iFrame elements and state and is a convenient way to quickly reset the form.
   *
   * When reload is complete, the ready event will be fired, at which time the iFrame can be customized.
   */
  reload(): void;

  /** Remove all event handlers currently registered via the on function. */
  removeHandlers(): void;

  /** Sets parameters to bypass some validation features of the iframe. Valid parameters that can be passed are allow_blank_name and allow_expired_date. If set to true, the related steps in validation will be skipped. Defaults to false. */
  setParam(
    parameter: 'allow_blank_name' | 'allow_expired_date',
    value: boolean
  ): void;

  //#endregion

  //#region ThreeDS Lifecycle

  ThreeDS: {
    /**   Capture browsers data. */
    serialize(
      /**
       * The size of the challenge iframe that will be presented to a user.
       * ```txt
       * '01' - 250px x 400px
       * '02' - 390px x 300px
       * '03' - 500px x 600px
       * '04' - 600px x 400px
       * '05' - fullscreen
       * ```
       */
      browserSize: '01' | '02' | '03' | '04' | '05',
      /** The accept header from your server side rendered page. */
      acceptHeader: string
    ): string;

    Lifecycle: typeof SpreedlyThreeDSLifecycle;
  };

  //#endregion

  //#region Tokenization

  /**
   * Trigger tokenization of the entered credit card. This will send the data contained within the iFrame fields to the Spreedly environment, along with any additional payment method data specified here.
   *
   * On successful tokenization, the paymentMethod event will be triggered. On failure, the errors event will be triggered.
   */
  tokenizeCreditCard(
    /** Map of additional payment method fields to store alongside tokenized card. */
    additionalFields: {
      month?: number;
      year?: number;
      email?: string;
      address1?: string;
      address2?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
      phone_number?: string;
      company?: string;
      shipping_address1?: string;
      shipping_address2?: string;
      shipping_city?: string;
      shipping_state?: string;
      shipping_zip?: string;
      shipping_country?: string;
      shipping_phone_number?: string;
      eligible_for_card_updater?: boolean;
      metadata?: Record<string, string>;
    } & ({ first_name: string; last_name: string } | { full_name: string })
  ): void;

  /** Request iFrame fields to report their validation status. Useful for real-time validation functionality. */
  validate(): void;

  //#endregion

  //#region Recache

  /**
   * Configure the iFrame to operate in recache mode.
   *
   * When iFrame has received and displayed the existing payment method information, the recacheReady event will be fired. */
  setRecache(
    /** Token of existing payment method in Spreedly environment. */
    token: string,
    /** Map of display options for existing payment method. Set card_type to support CVV validation, and last_four_digits to show the last four digits in the number field. */
    options: {
      card_type?: string;
      last_four_digits?: string;
    }
  ): void;

  /**
   * Trigger recache on existing payment method. Requires that setRecache has already been called.
   *
   *   On successful recache, the recache event will be triggered. On failure, the errors event will be triggered.
   */
  recache(): void;

  //#endregion

  //#region UI

  /**
   * Set the input type of the iFrame fields. This is useful to when you want different keyboards to display on mobile devices.
   *
   * By default, the iFrame fields are set to type=number, which displays the numerical keyboard in most browsers on most mobile devices. However, behavior does vary by browser. If you’d like to manually control the input field type you can do so with setFieldType.
   */
  setFieldType(
    /** The iFrame field to set the type. Can be one of number or cvv. */
    field: 'number' | 'cvv',
    /** The input field type. Can be one of number, text or tel. */
    type: 'number' | 'text' | 'tel'
  ): void;

  /** Style iFrame fields’ label. Although the label for each iFrame field is not displayed, it is still used by screen readers and other accessibility devices. */
  setLabel(
    /** The iFrame field to set the label. Can be one of number or cvv. */
    field: 'number' | 'cvv',
    /** The label text value. */
    label: string
  ): void;

  /** Set custom iFrame fields’ title attribute. Although the title for each iFrame field is not displayed, it can still be used by screen readers and other accessibility devices. By default, the title attribute is set to “credit card number” for the number field, and “cvv number” for the cvv field. If you would like to customize these titles you can do so with a call of this function. */
  setTitle(
    /** The iFrame field to set the title. Can be one of number or cvv. */
    field: 'number' | 'cvv',
    /** The title text value. */
    title: string
  ): void;

  /**
   * Set the card number format. If set to prettyFormat, the card number value will include spaces in the credit card number as they appear on a physical card. The number field must be set to type text or tel for pretty formatting to take effect.
   *
   * If set to maskedFormat, the card number and CVV values will be masked with * as the user enters text. Both the CVV and number fields must be set to type text for the masked formatting to take effect. Once maskedFormat has been set, the toggleMask function can be called to show the card number and CVV in plain text if they are masked, or mask them if they are shown.
   */
  setNumberFormat(
    format: 'prettyFormat' | 'plainFormat' | 'maskedFormat'
  ): void;

  /** Style iFrame fields’ placeholder text. */
  setPlaceholder(
    /** The iFrame field to set the placeholder. Can be one of number or cvv. */
    field: 'number' | 'cvv',
    /** The placeholder text value. */
    placeholder: string
  ): void;

  /** Style iFrame fields and placeholders using CSS. */
  setStyle(
    /** The iFrame field to apply the CSS to. Can be one of number, cvv or placeholder. The latest will apply the CSS to the placeholders in both the number and cvv fields. */
    field: 'number' | 'cvv' | 'placeholder',
    /** The CSS to apply. Should be vanilla CSS, -moz-appearance, or -webkit-appearance. All CSS properties should be constructed as a single string. */
    css: string
  ): void;

  /** Set the cursor focus to one of the iFrame fields. This is useful if you want to load your form with the card number field already in focus, or if you want to auto-focus one of the iFrame fields if they contain an input error. */
  transferFocus(
    /** The iFrame field to give focus to. Can be one of number or cvv. */
    field: 'number' | 'cvv'
  ): void;

  /** Toggle autocomplete functionality for card number and cvv fields. By default, the autocomplete attribute is enabled, so the first call of this function will disable autocomplete/ */
  toggleAutocomplete(): void;

  //#endregion

  //#region Click to Pay

  /** To set up the C2P flow the merchant needs to initialize the iframe library with an environmentKey and at least the required options described below. */
  c2pInit(
    /** The key of the Spreedly environment where the payment method should be tokenized. */
    environmentKey: string,
    /** Object with initialization options. Containing various fields to initialize the C2P SDK. */
    options: unknown
  ): void;

  /** Once the user selects a credit card, the merchant should enable or show a next or checkout button that triggers the Spreedly.c2pCheckout function. This function calls Mastercard and Spreedly, and the result is a Spreedly payment method token that the merchant can use in their backend for authorize/purchase transactions as usual. */
  c2pCheckout(
    /** Required, Boolean. Flag to know if it is a checkout with an existing card or a new card. */
    isCheckoutWithCard: boolean
  ): void;

  //#endregion

  //#region Events

  /**
   * Setup event handling after kickoff of Spreedly ThreeDS Lifecycle.
   *
   * Note: If you plan to run multiple 3DS authentications without a full page reload or redirect, this function should only be set up once. Invoking it multiple times will register the event handlers multiple times leading undefined behavior.
   */
  on(
    event: '3ds:status',
    callback: (
      /** Contains the context of the 3DS status. */
      event: {
        action: SpreedlyThreeDSAction;
        finalize: () => void;
      }
    ) => void
  ): void;

  /** Triggered when a javascript error occurs within the iFrame. This is useful for debugging runtime issues. */
  on(
    event: 'consoleError',
    callback: (
      /** Map of error properties. */
      error: {
        msg: string;
        url: string;
        line: string;
        col: string;
      }
    ) => void
  ): void;

  /** Triggered when a payment method is not successfully tokenized or recached. Requires a call to `tokenizeCreditCard` or `recache`. */
  on(
    event: 'errors',
    callback: (
      /** An array of error objects describing the errors on the payment method when submitted to Spreedly. */
      errors: {
        attribute: string;
        key: string;
        message: string;
      }[]
    ) => void
  ): void;

  /** Triggered when an input event occurs in either iFrame field. This is useful to provide real-time feedback to the user. */
  on(
    event: 'fieldEvent',
    callback: <T extends SpreedlyFieldEventType>(
      /** The name of the field triggering the event.  */
      name: 'number' | 'cvv',
      /** The event type. */
      type: T,

      /** The name of the field that currently has focus (this can be different from the named field depending on the event). */
      activeEl: 'number' | 'cvv',
      /** Map of properties indicating the state of the user’s input in the iFrame fields. This map is only populated on the input event type. */
      inputProperties: T extends SpreedlyFieldEventType.input
        ? SpreedlyInputProperties
        : never
    ) => void
  ): void;

  /** Triggered when a payment method is successfully tokenized by Spreedly. The host page must handle this event to take the payment method token and send it to the backend environment for further processing. Requires a call to tokenizeCreditCard. */
  on(
    event: 'paymentMethod',
    callback: (
      /** The token of the newly tokenized payment method. */
      token: string,
      /** A map of the full payment method in [JSON form](https://docs.spreedly.com/reference/api/v1/#show33). */
      paymentMethod: Record<string, unknown>
    ) => void
  ): void;

  /** Triggered when the iFrame is initialized and ready for configuration. setStyle and other UI function calls should be made within this event listener. This event will only fire after init() has been called. */
  on(event: 'ready', callback: () => void): void;

  /** Triggered when a payment method is successfully recached by Spreedly (and the CVV is now available on the payment method). The host page must handle this event to ping the backend environment that the payment method is ready for further processing. Requires a call to recache. */
  on(
    event: 'recache',
    callback: (
      /** The token of the newly tokenized payment method. */
      token: string,
      /** A map of the full payment method in [JSON form](https://docs.spreedly.com/reference/api/v1/#show33). */
      paymentMethod: Record<string, unknown>
    ) => void
  ): void;

  /** Triggered when iFrame is properly configured for recache. */
  on(event: 'recacheReady', callback: () => void): void;

  /** Triggered when validation of the iFrame is requested. This event will only fire after `validate()` has been called. */
  on(
    event: 'validation',
    callback: (
      /** Map of properties indicating the state of the user’s input in the iFrame fields. */
      inputProperties: SpreedlyInputProperties
    ) => void
  ): void;

  //#endregion

  //#region Testing

  /** Set the value the iFrame fields to a known test value. Any values that are not on the allowed list will be silently rejected. */
  setValue(
    /** The iFrame field to set the value.  */
    field: 'number' | 'cvv',
    /** The value to set the field to. The number field will only accept [test card numbers](https://docs.spreedly.com/reference/test-data/#credit-cards). The cvv field will only accept 12, 123, or 1234 */
    value: number
  ): void;

  //#endregion

  //#region Plugins

  // TODO: WIP

  //#endregion
}

declare const Spreedly: SpreedlyPaymentFrame;
