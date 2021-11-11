pragma solidity ^0.4.18;

contract ChatWei {

    struct Message {
        address sender;
        bytes32 content;
        uint timestamp;
    }

    struct ContractProperties {
        address ChatWeiOwner;
        address[] registeredUserAddress;
    }

    struct Inbox {
        uint numSentMessages;
        uint numReceivedMessages;
        mapping(uint => Message) sentMessages;
        mapping(uint => Message) receivedMessages;
    }

    mapping(address => Inbox) userInboxes;
    mapping(address => bool) hasRegistered;

    Inbox newInbox;
    Message newMessage;
    ContractProperties contractProperties;

    constructor () public {
        // constructor
         contractProperties.ChatWeiOwner = msg.sender;
    }

    function checkUserRegistration() public view returns (bool) {
        return hasRegistered[msg.sender];
    }

    function clearInbox() public {
        userInboxes[msg.sender] = newInbox;
    }

    function registerUser() public {
        if(!hasRegistered[msg.sender]) {
            userInboxes[msg.sender] = newInbox;
            hasRegistered[msg.sender] = true;
            contractProperties.registeredUserAddress.push(msg.sender);
        }
    }

    function getContractProperties() public view returns (address, address[]) {
        return (contractProperties.ChatWeiOwner, contractProperties.registeredUserAddress);
    }

    function sendMessage (address _receiver, bytes32 _content) public {
        newMessage.content = _content;
        newMessage.timestamp = now;
        newMessage.sender = msg.sender;

        // update senders inbox
        Inbox storage sendersInbox = userInboxes[msg.sender];
        sendersInbox.sentMessages[sendersInbox.numSentMessages] = newMessage;
        sendersInbox.numSentMessages++;

        // update receiver inbox;
        Inbox storage receiversInbox = userInboxes[_receiver];
        receiversInbox.receivedMessages[receiversInbox.numReceivedMessages] = newMessage;
        receiversInbox.numReceivedMessages++;
        return;
    }

    function receiveMessages () public view returns (bytes32[16], uint[], address[]) {
        Inbox storage receiversInbox = userInboxes[msg.sender];
        bytes32[16] memory content;
        address[] memory sender = new address[](16);
        uint[] memory timestamp = new uint[](16);

        for (uint256 m = 0; m < 15; m++) {
            Message memory message = receiversInbox.receivedMessages[m];
            content[m] = message.content;
            sender[m] = message.sender;
            timestamp[m] = message.timestamp;
        }

        return (content, timestamp, sender);
    }

    function getMyInboxSize() public view returns (uint, uint) {
        return (userInboxes[msg.sender].numSentMessages, userInboxes[msg.sender].numReceivedMessages);
    }
}