import BasePage from '../basepage.js';

class SwitchNetworkModal extends BasePage {
  // locators
  // * modal window
  switchNetworkModalLocator = {
    locator: 'switchNetworkDialog-dialogWindow-modalWindow',
    method: 'id',
  };
  // * modal title
  switchNetworkTitleLocator = {
    locator: 'switchNetworkDialog-dialogTitle-text',
    method: 'id',
  };
  // * modal close button
  switchNetworkCloseBtnLocator = {
    locator: 'switchNetworkDialog-closeModal-button',
    method: 'id',
  };
  // dropdown
  // * it should be called by the .dispatchEvent(mouseDownEvent);
  // * const mouseDownEvent = new MouseEvent(
  // * "mousedown", {
  // *		view: window, 
  // *		bubbles: true, 
  // *		cancelable: true,
  // *	}
  // * );
  switchNetworkDropdownLocator = {
    locator: 'switchNetworkDialog-selectNetwork-dropdown',
    method: 'id',
  }
  mainnetMenuItemLocator = {
    locator: 'switchNetworkDialog-selectNetwork_0-menuItem',
    method: 'id',
  }
  preprodtMenuItemLocator = {
    locator: 'switchNetworkDialog-selectNetwork_250-menuItem',
    method: 'id',
  }
  previewMenuItemLocator = {
    locator: 'switchNetworkDialog-selectNetwork_350-menuItem',
    method: 'id',
  }
  // cancel
  switchNetworkCancelBtnLocator = {
    locator: 'switchNetworkDialog-cancel-button',
    method: 'id',
  };
  // apply
  switchNetworkApplyBtnLocator = {
    locator: 'switchNetworkDialog-apply-button',
    method: 'id',
  };

  // methods
}

export default SwitchNetworkModal;
