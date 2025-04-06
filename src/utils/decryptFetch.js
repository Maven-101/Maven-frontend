import { ethers, keccak256, toUtf8Bytes } from "ethers";

// Create a notification system
const showNotification = (message, isSuccess = true) => {
  const notification = document.createElement('div');
  notification.className = `eth-notification ${isSuccess ? 'success' : 'error'}`;
  notification.innerHTML = `
    <div class="eth-notification-icon">
      ${isSuccess ? '✓' : '✕'}
    </div>
    <div class="eth-notification-content">
      ${message}
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
};

// Add this CSS to your main stylesheet
const addNotificationStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .eth-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      border-radius: 8px;
      color: white;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      transform: translateX(0);
      transition: all 0.3s ease;
      max-width: 350px;
    }
    
    .eth-notification.success {
      background: linear-gradient(135deg, #4CAF50, #2E7D32);
      border-left: 5px solid #1B5E20;
    }
    
    .eth-notification.error {
      background: linear-gradient(135deg, #F44336, #C62828);
      border-left: 5px solid #B71C1C;
    }
    
    .eth-notification-icon {
      font-size: 20px;
      font-weight: bold;
    }
    
    .eth-notification.fade-out {
      transform: translateX(120%);
      opacity: 0;
    }
    
    @media (max-width: 768px) {
      .eth-notification {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: calc(100% - 20px);
      }
    }
  `;
  document.head.appendChild(style);
};

// Add styles when module loads
addNotificationStyles();

const register = async (facialFeatures, cid) => {
  try {
    console.log("registering");
    if (!window.ethereum) {
      showNotification("MetaMask not installed", false);
      return false;
    }

    const quantized = facialFeatures.map((v) => v.toFixed(5));
    const embeddingStr = quantized.join(",");

    const facialFeaturesHash = keccak256(toUtf8Bytes(embeddingStr));
    const cidHash = keccak256(toUtf8Bytes(cid));

    const provider = new ethers.BrowserProvider(window.ethereum);
    provider.send("eth_requestAccounts", []);
    const addresses = await provider.listAccounts();
    const address = addresses[0].address;
    console.log("Connected account:", address);
    const signer = await provider.getSigner();

    const contractABI = [
      {
        type: "function",
        name: "getCIDHash",
        inputs: [
          {
            name: "user",
            type: "address",
            internalType: "address",
          },
        ],
        outputs: [
          {
            name: "",
            type: "bytes32",
            internalType: "bytes32",
          },
        ],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "getFacialFeatureHash",
        inputs: [
          {
            name: "user",
            type: "address",
            internalType: "address",
          },
        ],
        outputs: [
          {
            name: "",
            type: "bytes32",
            internalType: "bytes32",
          },
        ],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "register",
        inputs: [
          {
            name: "facialFeatureHash",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "CIDHash",
            type: "bytes32",
            internalType: "bytes32",
          },
        ],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "event",
        name: "Registered",
        inputs: [
          {
            name: "user",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "facialFeatureHash",
            type: "bytes32",
            indexed: false,
            internalType: "bytes32",
          },
          {
            name: "CIDHash",
            type: "bytes32",
            indexed: false,
            internalType: "bytes32",
          },
        ],
        anonymous: false,
      },
      {
        type: "error",
        name: "Already_Registered",
        inputs: [],
      },
      {
        type: "error",
        name: "Not_Registered",
        inputs: [],
      },
    ];
    const contractAddress = "0x16ab69Ed506F7F3aBFf5Ee3565e57A22C5f3c305";

    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const tx = await contract.register(facialFeaturesHash, cidHash);

    const filterAppEventsByCaller = contract.filters.Registered(address);
    contract.on(filterAppEventsByCaller, () => {
      console.log("Registered successfully");
      showNotification("User registered successfully on blockchain!", true);
      return true;
    });
    
    return true;
  } catch (error) {
    console.error(error);
    const errorMsg = error.message.includes("Already_Registered") 
      ? "This user is already registered" 
      : `Registration failed: ${error.message}`;
    console.error("Error shows");
    showNotification(errorMsg, false);
    return false;
  }
};

export default register;