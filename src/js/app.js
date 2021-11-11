var replyToAddress = "0x"
var myInboxSize = 0;

App = {
    web3Provider: null,
    contracts: {},

    init: function() {
        return App.initWeb3();
    },

    initWeb3: function() {

        // if (typeof web3 !== "undefined") {
        //     // use metamask provider
        //     App.web3Provider = web3.currentProvider;
        //     web3 = new Web3(web3.currentProvider);
        //     App.setStatus('Metamask detected')
        // } else {
        //     // set provider you want from Web3.providers
        //     alert("Please install metamask you wanker.");
        //     App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        //     return null;
        // }

        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        web3 = new Web3(App.web3Provider);

        //get the initial account balance so it can be displayed;

        web3.eth.getAccounts(function(err, accounts) {
            if (err != null) {
                alert("There was an error fetching your account, please try again later");
                return;
            }

            account = accounts[2];
            if (!account) {
                App.setStatus("Please login to metamask.");
                alert("Could not fetch your account. make sure you are logged in to Metamask, then refresh the page.");
                return;
            }
            console.log(account)
            return App.initContract();
        })
    },


    initContract: function() {
        $.getJSON('ChatWei.json', function(ChatWeiArtifact) {
            // get the necessary contract artifact file and use it 
            // to instantiate a truffle contract abstraction
            App.contracts.ChatWei = TruffleContract(ChatWeiArtifact);

            // set the provider for our contract
            App.contracts.ChatWei.setProvider(App.web3Provider);
            return App.getContractProperties();
        })
    },


    getContractProperties: function() {
        var self = this;
        var meta;
        App.contracts.ChatWei.deployed().then(function(instance) {
            meta = instance;
            return meta.getContractProperties.call({ from: account })
        }).then(function(value) {
            var networkAddress = App.contracts.ChatWei.address;
            document.getElementById("contractAddress").innerHTML = networkAddress;
            var by = value[0];
            var registeredUserAddress = value[1];

            var numRegisteredUsers = registeredUserAddress.length;
            var select = "";

            for (i = 0; i < numRegisteredUsers; i++) {
                select += `<option val=${i}> ${registeredUserAddress[i]}</option>`
            }

            $('#registeredUsersAddressMenu').html(select);
            document.getElementById("contractOwner").innerHTML = by;
        }).catch(function(err) {
            console.error(e)
            self.setStatus("");
        })

        return App.displayMyAccountInfo();
    },


    displayMyAccountInfo: function() {
        web3.eth.getAccounts(function(err, account) {
            if (err == null) {
                App.account = account[1];
                document.getElementById("myAddress").innerHTML = App.account
                web3.eth.getBalance(account[0], function(err, balance) {
                    if (balance == 0) {
                        alert("Your account has 0 balance. Transfer some Ether to metamask you wanker.");
                        App.setStatus('Please buy more ether.')
                        return;
                    } else {
                        document.getElementById("myBalance").innerHTML = web3.fromWei(balance, "ether").toNumber() + " Ether";
                        return App.checkUserRegistration();
                    }
                })
            }
        })
        return null;
    },

    setStatus: function(message) {
        document.getElementById("status").innerHTML = message;
    },

    checkUserRegistration: function() {
        var self = this;
        self.setStatus('Checking user registration, please wait you wanker...');
        var meta;

        App.contracts.ChatWei.deployed().then(function(instance) {
            meta = instance;
            return meta.checkUserRegistration.call({ from: account })
        }).then(function(value) {
            if (value) {
                self.setStatus('user is registered')
            } else {
                if (confirm('new user we need to setup an inbox you wanker')) {
                    App.registerUser();
                } else {
                    return null;
                }
            }
        }).catch(function(err) {
            console.error(err);
            self.setStatus('Error checking user registration you wanker')
        });

        return App.getMyInboxSize();
    },

    registerUser: function() {
        var self = this;
        self.setStatus('User registration you wanker')
        var meta;
        App.contracts.ChatWei.deployed().then(function(instance) {
            meta = instance;
            return meta.registerUser({}, {
                from: account,
                gas: 6385876,
                gasPrice: 20000000000
            })
        }).then(function(result) {
            console.warn('result', result)
            var gasUsedWei = result.receipt.gasUsed;
            var gasUsedEther = web3.fromWei(gasUsedWei, "ether");
            self.setStatus("user is registered you wanker, gas spent" + gasUsedWei + "wei")
            alert('a personal inbox has been established you wanker you are all set.')
        }).catch(function(err) {
            console.error(err);
            self.setStatus("Error registering user")
        })
        return null;
    },

    getMyInboxSize: function() {
        var self = this;
        var meta;
        App.contracts.ChatWei.deployed().then(function(instance) {
            meta = instance;
            return meta.getMyInboxSize.call({ from: account })
        }).then(function(value) {

            // set global variable
            myInboxSize = value[1];
            if (myInboxSize > 0) {
                document.getElementById("receivedTable").style.display = "inline";
                return App.receiveMessages();
            } else {
                document.getElementById("receivedTable").style.display = "none";
            }

        }).catch(function(err) {
            console.error(err);
            self.setStatus("Error getting inbox size: ")
        })
    },

    sendMessage: function() {
        var self = this;
        var receiver = document.getElementById("receiver").value;
        if (receiver == "") {
            App.setStatus("Send address cannot be empty you wanker");
            return null;
        }
        if (!web3.isAddress(receiver)) {
            App.setStatus("you did not enter a valid ethereum address you wanker.")
            return null;
        }

        var myAddress = document.getElementById("myAddress").innerHTML;
        var newMessage = document.getElementById("message").value
        if (newMessage == null) {
            App.setStatus("message is empty you wanker.")
            return null;
        }
        document.getElementById("message").value = "";
        document.getElementById("sendMessageButton").disabled = true;
        this.setStatus("Sending message you wanker");
        var meta;
        App.contracts.ChatWei.deployed().then(function(instance) {
            meta = instance;
            return meta.sendMessage(receiver, newMessage, {
                from: account,
                gas: 6385876,
                gasPrice: 20000000000
            });
        }).then(function(result) {
            console.log(result)
            var gasUsedWei = result.receipt.gasUsed;
            var gasUsedEther = web3.fromWei(gasUsedWei, "ether");
            self.setStatus(`Message successfully sent. gas spent wanker is ${gasUsedWei} wei`);
            document.getElementById("sendMessageButton").disabled = false;
            document.getElementById("message").value = "";
        }).catch(function(err) {
            console.error(err);
            self.setStatus("Error sending message you wanker.")
        })

    },

    replyToMessage: function() {
        document.getElementById("message").focus();
        document.getElementById("message").select();
        document.getElementById("receiver").value = replyToAddress;
    },

    copyAddressToSend: function() {
        var sel = document.getElementById("registeredUsersAddressMenu");
        var copyText = sel.options[sel.selectedIndex];
        document.getElementById("receiver").value = copyText.innerHTML;
        document.getElementById("message").focus();
        document.getElementById("message").select();
    },

    receiveMessages: function() {
        var self = this;
        var meta;
        App.contracts.ChatWei.deployed().then(function(instance) {
            meta = instance;
            return meta.receiveMessages.call({}, { from: account })
        }).then(function(value) {
            var content = value[0];
            var timestamp = value[1];
            var sender = value[2]

            for (var m = 0; m < myInboxSize; m++) {
                var tbody = document.getElementById("mytable-body");
                var row = tbody.insertRow();
                var cell1 = row.insertCell();
                cell1.innerHTML = timestamp[m];
                var cell2 = row.insertCell();
                cell2.innerHTML = sender[m];
                var cell3 = row.insertCell();

                var thisRowReceivedText = content[m].toString();
                var receivedAscii = web3.toAscii(thisRowReceivedText);
                var thisRowSenderAddress = sender[m];
                cell3.innerHTML = receivedAscii;
                cell3.hidden = true;
            }

            var table = document.getElementById("mytable");
            var rows = table.rows;

            for (var i = 1; i < rows.length; i++) {
                rows[i].onclick = (function(e) {
                    replyToAddress = this.cells[1].innerHTML;
                    var thisRowContent = (this.cells[2].innerHTML);
                    document.getElementById("reply").innerHTML = thisRowContent;
                })
            }

            var clearInboxButton = document.createElement("button");
            clearInboxButton.id = "clearInboxButton";
            clearInboxButton.type = "clearInboxButton";
            clearInboxButton.disabled = false;
            clearInboxButton.style.width = "100%";
            clearInboxButton.style.height = "30px";
            clearInboxButton.style.margin = "15px 0px";
            clearInboxButton.innerHTML = "Clear inbox";
            document.getElementById("receivedTable").appendChild(clearInboxButton);
            clearInboxButton.addEventListener("click", function() {
                document.getElementById("clearInboxButton").disabled = true;
                App.clearInbox();
            })
        }).catch(function(err) {
            console.error(err)
            self.setStatus("Error getting status you wanker.")
        })
        return;
    },

    clearInbox: function() {
        var self = this;
        var meta;
        this.setStatus("Clearing inbox");

        App.contracts.ChatWei.deployed().then(function(instance) {
            meta = instance;
            return meta.clearInbox({}, {
                from: account,
                gas: 6385876,
                gasPrice: 20000000000
            })
        }).then(function(value) {
            var clearInboxButton = document.getElementById("clearInboxButton");
            clearInboxButton.parentNode.removeChild(clearInboxButton);
            $("#mytable tr").remove();
            document.getElementById("receivedTable").style.display = "none";
            alert("Your inbox was clear you wanker.");
            self.setStatus("Inbox cleared")
        }).catch(function(err) {
            console.error(err)
            self.setStatus("Error clearing the inbox you wanker.")
        })
    }
}

$(document).ready(function() {
    App.init();
})