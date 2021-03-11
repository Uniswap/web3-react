import HookedWallet from 'web3-provider-engine/subproviders/hooked-wallet';
import DcentConnector from 'dcent-web-connector';
import LOG from '../utils/log';

const pathMap = {};
let networkId;

/**
 *
 * @param {string} address
 */
const getPath = async address => {
  for (const key in pathMap) {
    if (key.toLowerCase() === address.toLowerCase()) return pathMap[key];
  }
};

const openPopup = async () => {
  const popupResult = await DcentConnector.dcentPopupWindow();
  if (popupResult != null && popupResult.header.status === 'error') {
    throw new Error(popupResult.body.error.message);
  }
  return popupResult;
};

// D'CENT Bridge Service window appears and wait for the device to connect.
const waitConnectWallet = async () => {
  if (!DcentConnector.popupWindow || DcentConnector.popupWindow.closed) {
    throw new Error('popup_closed');
  }
  const infoResult = await DcentConnector.info();
  if (!infoResult.body.parameter.isUsbAttached) {
    await new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        waitConnectWallet()
          .then(() => {
            resolve();
          })
          .catch(err => {
            reject(err);
          });
      }, 500);
    });
  }
};

const getAccountsAsync = async () => {
  if (Object.keys(pathMap).length > 0) {
    // If has 'pathMap'
    return Object.keys(pathMap);
  }

  await openPopup();
  await waitConnectWallet();

  // Get all accounts list
  const accountResult = await DcentConnector.getAccountInfo();
  LOG('dcent accountInfo result: ', accountResult);
  const accounts = accountResult.body.parameter.account;
  LOG('dcent accounts: ', accounts);

  // Get only ethereum accounts
  const etherAccounts = accounts.filter(
    accountInfo => accountInfo.coin_name === DcentConnector.coinGroup.ETHEREUM
  );
  const paths = [];
  etherAccounts.forEach(accountInfo => {
    paths.push(accountInfo.address_path);
  });
  LOG('dcent ethereum path: ', paths);
  // There is no account
  if (paths.length === 0) {
    paths.push("m/44'/60'/0'/0/0");
    console.warn(
      "[D'CENT] cannot find exists ethereum accounts. use default path"
    );
  }

  // get address with BIP32 path
  const addresses = [];
  for (const path of paths) {
    const addressResult = await DcentConnector.getAddress(
      DcentConnector.coinType.ETHEREUM,
      path
    );
    pathMap[addressResult.body.parameter.address] = path;
    addresses.push(addressResult.body.parameter.address);
  }
  LOG('dcent addresses: ', addresses);

  DcentConnector.popupWindowClose();

  return addresses;
};

const signTransaction = (txData, callback) => {
  if (typeof callback === 'undefined') {
    return signTransactionAsync(txData);
  } else {
    signTransactionAsync(txData)
      .then(transaction => {
        callback(null, transaction);
      })
      .catch(err => {
        callback(err, null);
      });
  }
};

/**
 *
 * @param {Object} txData
 * @param {string} txData.from
 * @param {string} txData.gas
 * @param {string} txData.gasPrice
 * @param {string} txData.nonce
 * @param {string} txData.to
 * @param {string} txData.value
 * @param {string} txData.data
 */
const signTransactionAsync = async txData => {
  await openPopup();
  await waitConnectWallet();

  LOG('dcent signTransactionAsync txData: ', txData);
  LOG('dcent signTransactionAsync pathMap: ', pathMap);
  const path = await getPath(txData.from);
  if (!path) throw new Error(`address unknown '${txData.from}'`);
  LOG('dcent signTransactionAsync path: ', path);
  LOG('dcent signTransactionAsync networkId: ', networkId);
  let txResult;
  try {
    txResult = await DcentConnector.getEthereumSignedTransaction(
      DcentConnector.coinType.ETHEREUM,
      txData.nonce,
      txData.gasPrice,
      txData.gas,
      txData.to,
      txData.value || '0',
      txData.data || '0x',
      path,
      networkId
    );
  } catch (err) {
    if (err.header.response_from === 'wam') {
      throw new Error('no_device');
    }
    if (err.body.error.code) {
      throw new Error(err.body.error.code);
      // throw new Error('Action cancelled by user')
    }
    throw err;
  } finally {
    DcentConnector.popupWindowClose();
  }

  LOG('dcent signTransaction tx: ', txResult);
  return '0x' + txResult.body.parameter.signed;
};

const signPersonalMessage = (msgData, callback) => {
  if (typeof callback === 'undefined') {
    return signPersonalMessageAsync(msgData);
  } else {
    signPersonalMessageAsync(msgData)
      .then(transaction => {
        callback(null, transaction);
      })
      .catch(err => {
        callback(err, null);
      });
  }
};
/**
 *
 * @param {Object} msgData
 * @param {string} msgData.data
 * @param {string} msgData.from
 */
const signPersonalMessageAsync = async msgData => {
  await openPopup();
  await waitConnectWallet();

  LOG('dcent signPersonalMessageAsync msgData= ', msgData);
  const path = await getPath(msgData.from);
  if (!path) throw new Error(`address unknown '${msgData.from}'`);
  let txResult;
  try {
    txResult = await DcentConnector.getEthereumSignedMessage(
      msgData.data,
      path
    );
  } catch (err) {
    if (err.header.response_from === 'wam') {
      throw new Error('no_device');
    }
    if (err.body.error.code) {
      throw new Error(err.body.error.code);
    }
    throw err;
  } finally {
    DcentConnector.popupWindowClose();
  }

  LOG('dcent signPersonalMessageAsync result: ', txResult);
  return txResult.body.parameter.sign;
};

export default class DcentHookedWalletSubprovider extends HookedWallet {
  constructor(opts: any = {}) {
    const extOpts = {
      signTransaction,
      signPersonalMessage
    };
    const options = Object.assign(opts, extOpts);
    LOG('dcent DcentHookedWalletSubprovider constructor options: ', options);

    networkId = opts.networkId;
    super(options);
  }

  /**
   * @param {function(Error, string[])} callback
   * @return {Promise|undefined}
   */
  getAccounts(callback) {
    if (!callback) {
      return getAccountsAsync();
    } else {
      getAccountsAsync()
        .then(accounts => {
          callback(null, accounts);
        })
        .catch(e => {
          callback(e, null);
        });
    }
  }
}