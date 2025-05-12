import { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { storage } from "../firebase/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PhishingIcon from '@mui/icons-material/Phishing';
import CloseIcon from '@mui/icons-material/Close';
import { formatDistanceToNow } from 'date-fns';
import "./Chat.scss";

const Chat = () => {
  const { currentUser, api } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch contacts (people the user follows)
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        // Get people the user follows
        const followingResponse = await api.get("/following");
        
        // Get user details for each person they follow
        const contactsPromises = followingResponse.data.map(async (follow) => {
          try {
            const userResponse = await api.get(`/user/${follow.followee}`);
            return userResponse.data;
          } catch (error) {
            console.error(`Error fetching user ${follow.followee}:`, error);
            return null;
          }
        });
        
        const contactsData = (await Promise.all(contactsPromises)).filter(contact => contact !== null);
        
        // Get conversation partners from chat API
        const chatResponse = await api.get("/chat/my-chats");
        
        // Extract unique users from chat data
        const chatPartners = new Set();
        chatResponse.data.forEach(chat => {
          const partnerId = chat.senderId === currentUser.id ? chat.receiverId : chat.senderId;
          chatPartners.add(partnerId);
        });
        
        // Fetch users that are chat partners but not in contacts
        const additionalContactsPromises = Array.from(chatPartners)
          .filter(partnerId => !contactsData.some(contact => contact.id === partnerId))
          .map(async partnerId => {
            try {
              const userResponse = await api.get(`/user/${partnerId}`);
              return userResponse.data;
            } catch (error) {
              console.error(`Error fetching user ${partnerId}:`, error);
              return null;
            }
          });
        
        const additionalContacts = (await Promise.all(additionalContactsPromises)).filter(contact => contact !== null);
        
        // Combine contacts and chat partners, remove duplicates
        const allContacts = [...contactsData, ...additionalContacts]
          .filter((contact, index, self) => 
            index === self.findIndex(c => c.id === contact.id)
          )
          .sort((a, b) => a.name.localeCompare(b.name));
        
        setContacts(allContacts);
        
        // Organize conversations by partner
        const conversationsMap = {};
        
        // Process each contact to get their conversation
        for (const contact of allContacts) {
          try {
            const conversationResponse = await api.get(`/chat/conversation/${contact.id}`);
            if (conversationResponse.data && conversationResponse.data.length > 0) {
              // Remove duplicates (by ID) before adding to the conversations map
              const uniqueMessages = conversationResponse.data.filter((message, index, self) =>
                index === self.findIndex((m) => m.id === message.id)
              );
              
              conversationsMap[contact.id] = uniqueMessages;
            }
          } catch (error) {
            console.error(`Error fetching conversation with ${contact.id}:`, error);
          }
        }
        
        setConversations(conversationsMap);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        setIsLoading(false);
      }
    };
    
    fetchContacts();
  }, [currentUser.id, api]);

  // Scroll to bottom of messages when activeChat changes or new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [activeChat, conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleContactClick = (contactId) => {
    setActiveChat(contactId);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !image) || !activeChat) return;
    
    try {
      let photoURL = null;
      
      // Upload image if there is one
      if (image) {
        const storageRef = ref(storage, `chats/${currentUser.id}/${uuidv4()}`);
        const uploadTask = uploadBytesResumable(storageRef, image);
        
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              setUploadProgress(progress);
            },
            (error) => {
              console.error("Error uploading image:", error);
              reject(error);
            },
            async () => {
              try {
                photoURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve();
              } catch (err) {
                reject(err);
              }
            }
          );
        });
      }
      
      // Determine message type and content
      let messageType = "text";
      let messageContent = message.trim();
      
      if (photoURL) {
        if (messageContent) {
          messageType = "both";
          messageContent = `${messageContent}|${photoURL}`;
        } else {
          messageType = "image";
          messageContent = photoURL;
        }
      }
      
      // Create chat message
      const chatData = {
        senderId: currentUser.id,
        receiverId: activeChat,
        message: messageContent,
        type: messageType,
        date: new Date()
      };
      
      // Clear form immediately to prevent duplicate sends
      const currentMessageText = message;
      const currentImageData = image;
      setMessage("");
      setImage(null);
      setImageUrl("");
      setUploadProgress(0);
      
      // Send the message to the server
      const response = await api.post('/chat', chatData);
      
      // Only update the conversation state if we get a valid response
      if (response.data && response.data.id) {
        setConversations(prev => {
          // Create a copy of the previous conversations state
          const updatedConversations = {...prev};
          
          // Initialize the array for this contact if it doesn't exist
          if (!updatedConversations[activeChat]) {
            updatedConversations[activeChat] = [];
          }
          
          // Check if the message is already in the conversation (by id or similar content)
          const isDuplicate = updatedConversations[activeChat].some(msg => 
            msg.id === response.data.id || 
            (msg.senderId === response.data.senderId && 
             msg.receiverId === response.data.receiverId &&
             msg.message === response.data.message &&
             Math.abs(new Date(msg.date) - new Date(response.data.date)) < 1000) // Within 1 second
          );
          
          // Only add the message if it's not a duplicate
          if (!isDuplicate) {
            updatedConversations[activeChat].push(response.data);
          }
          
          return updatedConversations;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // If there's an error, you may want to re-enable the form with the previous values
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageContent = (message, type) => {
    if (type === "text") {
      return <p>{message}</p>;
    } else if (type === "image") {
      return <img src={message} alt="Chat attachment" className="message-image" />;
    } else if (type === "both") {
      const [text, imageUrl] = message.split('|');
      return (
        <>
          <p>{text}</p>
          <img src={imageUrl} alt="Chat attachment" className="message-image" />
        </>
      );
    }
    return <p>{message}</p>;
  };

  const formatMessageTime = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (isLoading) {
    return <div className="chat-loading">Loading chats...</div>;
  }

  return (
    <div className="chat-container">
      <div className="contacts-panel">
        <div className="contacts-header">
          <h3>Your Conversations</h3>
        </div>
        <div className="contacts-list">
          {contacts.length === 0 ? (
            <div className="no-contacts">
              <p>No contacts found. Follow some users to start chatting!</p>
            </div>
          ) : (
            contacts.map((contact) => {
              const hasMessages = !!conversations[contact.id];
              const lastMessage = hasMessages 
                ? conversations[contact.id][conversations[contact.id].length - 1] 
                : null;
              
              return (
                <div 
                  key={contact.id} 
                  className={`contact-item ${activeChat === contact.id ? 'active' : ''} ${hasMessages ? 'has-messages' : ''}`}
                  onClick={() => handleContactClick(contact.id)}
                >
                  <div className="contact-avatar">
                    <img src={contact.profilePicture} alt={contact.name} />
                  </div>
                  <div className="contact-info">
                    <div className="contact-name">{contact.name} {contact.lastname}</div>
                    {lastMessage && (
                      <div className="contact-preview">
                        {lastMessage.type === "image" 
                          ? "📷 Image" 
                          : (lastMessage.type === "both" 
                              ? lastMessage.message.split('|')[0].substring(0, 30) + (lastMessage.message.split('|')[0].length > 30 ? "..." : "") 
                              : lastMessage.message.substring(0, 30) + (lastMessage.message.length > 30 ? "..." : "")
                            )
                        }
                      </div>
                    )}
                  </div>
                  {lastMessage && (
                    <div className="contact-time">
                      {formatMessageTime(lastMessage.date)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <div className="chat-panel">
        {activeChat ? (
          <>
            <div className="chat-header">
              {contacts.find(c => c.id === activeChat) && (
                <>
                  <img 
                    src={contacts.find(c => c.id === activeChat).profilePicture} 
                    alt={contacts.find(c => c.id === activeChat).name} 
                    className="chat-avatar" 
                  />
                  <div className="chat-user">
                    {contacts.find(c => c.id === activeChat).name} {contacts.find(c => c.id === activeChat).lastname}
                  </div>
                </>
              )}
            </div>
            
            <div className="messages-container">
              {conversations[activeChat] && conversations[activeChat].length > 0 ? (
                <div className="messages-list">
                  {/* Filter out any duplicate messages by ID before rendering */}
                  {conversations[activeChat]
                    .filter((msg, index, self) => 
                      index === self.findIndex(m => m.id === msg.id)
                    )
                    .map((msg, index) => (
                      <div 
                        key={msg.id || index} 
                        className={`message ${msg.senderId === currentUser.id ? 'outgoing' : 'incoming'}`}
                      >
                        <div className="message-content">
                          {formatMessageContent(msg.message, msg.type)}
                          <div className="message-time">{formatMessageTime(msg.date)}</div>
                        </div>
                      </div>
                    ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="no-messages">
                  <p>No messages yet. Send a message to start the conversation!</p>
                </div>
              )}
            </div>
            
            <div className="message-form">
              {imageUrl && (
                <div className="image-preview">
                  <img src={imageUrl} alt="Preview" />
                  <button 
                    className="remove-image" 
                    onClick={() => {
                      setImage(null);
                      setImageUrl("");
                    }}
                  >
                    <CloseIcon />
                  </button>
                </div>
              )}
              
              <div className="message-input">
                <textarea 
                  placeholder="Type a message..." 
                  value={message}
                  onChange={handleMessageChange}
                  onKeyPress={handleKeyPress}
                />
                <div className="message-actions">
                  <div className="file-input">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                    />
                    <button 
                      className="attach-button"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <AttachFileIcon />
                    </button>
                  </div>
                  <button 
                    className="send-button"
                    onClick={handleSendMessage}
                    disabled={!message.trim() && !image}
                    title="Send message"
                  >
                    <PhishingIcon />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="no-active-chat">
            <div className="no-chat-message">
              <h3>Select a contact to start chatting</h3>
              <p>Choose from your contacts list on the left</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;