// Initialize R-Tokens and transactions
let customerBalance = 5000; // Example wallet balance
let rTokens = 0;
let pendingTransactions = JSON.parse(localStorage.getItem("pendingTransactions")) || [];

// Seller variables
let currentPIN = "";
let sellerQRData = "";

// Update UI on load
updateUI();

// Load R-Tokens (offline balance)
function loadRTokens(amount) {
  if (amount <= customerBalance) {
    rTokens += amount;
    customerBalance -= amount;
    alert(`₹${amount} R-Tokens loaded for offline use.`);
    updateUI();
  } else {
    alert("Insufficient balance!");
  }
}

// Generate Seller QR with encrypted PIN
function generateSellerQR() {
  currentPIN = Math.floor(1000 + Math.random() * 9000); // 4-digit PIN
  const encryptedPIN = CryptoJS.AES.encrypt(currentPIN.toString(), "RToken@Hills123").toString();
  sellerQRData = `RTOKEN:${Date.now()}?pin=${encryptedPIN}`;
  
  document.getElementById("pin-display").textContent = `PIN: ${currentPIN}`;
  document.getElementById("seller-qr").innerHTML = "";
  new QRCode(document.getElementById("seller-qr"), sellerQRData);
}

// Simulate QR scanning (for demo)
function startScanner() {
  document.getElementById("scanner-modal").style.display = "block";
  // In a real app, use QuaggaJS here
  setTimeout(() => {
    stopScanner();
    const scannedData = prompt("Simulate QR scan. Paste QR data:");
    if (scannedData) processScannedQR(scannedData);
  }, 1000);
}

function stopScanner() {
  document.getElementById("scanner-modal").style.display = "none";
}

// Process scanned QR data
function processScannedQR(scannedData) {
  if (scannedData.includes("RTOKEN:")) {
    const encryptedPIN = scannedData.split("pin=")[1];
    const pin = prompt("Enter 4-digit PIN from seller:");
    
    // Decrypt PIN
    const decryptedPIN = CryptoJS.AES.decrypt(encryptedPIN, "RToken@Hills123").toString(CryptoJS.enc.Utf8);
    
    if (pin === decryptedPIN) {
      const amount = prompt("Enter amount to pay:");
      if (amount && amount <= rTokens) {
        rTokens -= amount;
        pendingTransactions.push({
          amount: amount,
          seller: "seller123",
          timestamp: new Date().toISOString()
        });
        localStorage.setItem("pendingTransactions", JSON.stringify(pendingTransactions));
        alert("Payment successful! Will sync when online.");
        updateUI();
      } else {
        alert("Invalid amount or insufficient R-Tokens!");
      }
    } else {
      alert("Wrong PIN!");
    }
  }
}

// Switch between customer/seller views
function switchMode() {
  const customerView = document.getElementById("customer-view");
  const sellerView = document.getElementById("seller-view");
  const modeText = document.getElementById("mode-text");
  
  if (customerView.style.display === "none") {
    customerView.style.display = "block";
    sellerView.style.display = "none";
    modeText.textContent = "Seller";
  } else {
    customerView.style.display = "none";
    sellerView.style.display = "block";
    modeText.textContent = "Customer";
  }
}

// Update UI elements
function updateUI() {
  document.getElementById("r-tokens").textContent = rTokens;
  document.getElementById("pending-tx").textContent = pendingTransactions.length;
}

// Sync transactions when online
function syncTransactions() {
  if (navigator.onLine && pendingTransactions.length > 0) {
    alert(`Syncing ₹${pendingTransactions.reduce((a, b) => a + Number(b.amount), 0)}...`);
    // In a real app, send to Firebase here
    pendingTransactions = [];
    localStorage.removeItem("pendingTransactions");
    updateUI();
  }
}

// Check network status
window.addEventListener("online", syncTransactions);