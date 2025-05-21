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

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const followingResponse = await api.get("/following");
        
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
        
        const chatResponse = await api.get("/chat/my-chats");
        
        const chatPartners = new Set();
        chatResponse.data.forEach(chat => {
          const partnerId = chat.senderId === currentUser.id ? chat.receiverId : chat.senderId;
          chatPartners.add(partnerId);
        });
        
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
        
        const allContacts = [...contactsData, ...additionalContacts]
          .filter((contact, index, self) => 
            index === self.findIndex(c => c.id === contact.id)
          )
          .sort((a, b) => a.name.localeCompare(b.name));
        
        setContacts(allContacts);
        
        const conversationsMap = {};
        
        for (const contact of allContacts) {
          try {
            const conversationResponse = await api.get(`/chat/conversation/${contact.id}`);
            if (conversationResponse.data && conversationResponse.data.length > 0) {
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

  useEffect(() => {
    if (!isLoading && contacts.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const sellerId = urlParams.get('seller');
      
      if (sellerId) {
        const sellerIdNum = parseInt(sellerId);
        
        const sellerContact = contacts.find(contact => contact.id === sellerIdNum);
        
        if (sellerContact) {
          setActiveChat(sellerIdNum);
          
          const hasExistingConversation = conversations[sellerIdNum] && 
                                          conversations[sellerIdNum].length > 0;
          
          if (!hasExistingConversation) {
            setMessage("Hi, I'm interested in your listing on the marketplace.");
          }
        } else {
          const fetchSellerInfo = async () => {
            try {
              const sellerResponse = await api.get(`/user/${sellerIdNum}`);
              
              if (sellerResponse.data) {
                const newContact = sellerResponse.data;
                setContacts(prevContacts => [...prevContacts, newContact]);
                
                setActiveChat(sellerIdNum);
                
                setMessage("Hi, I'm interested in your listing on the marketplace.");
              }
            } catch (error) {
              console.error("Error fetching seller info:", error);
            }
          };
          
          fetchSellerInfo();
        }
        
        window.history.replaceState({}, document.title, "/chat");
      }
    }
  }, [isLoading, contacts, conversations, api]);

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
      
      const chatData = {
        senderId: currentUser.id,
        receiverId: activeChat,
        message: messageContent,
        type: messageType,
        date: new Date()
      };
      
      const currentMessageText = message;
      const currentImageData = image;
      setMessage("");
      setImage(null);
      setImageUrl("");
      setUploadProgress(0);
      
      const response = await api.post('/chat', chatData);
      
      if (response.data && response.data.id) {
        setConversations(prev => {
          const updatedConversations = {...prev};
          
          if (!updatedConversations[activeChat]) {
            updatedConversations[activeChat] = [];
          }
          
          const isDuplicate = updatedConversations[activeChat].some(msg => 
            msg.id === response.data.id || 
            (msg.senderId === response.data.senderId && 
             msg.receiverId === response.data.receiverId &&
             msg.message === response.data.message &&
             Math.abs(new Date(msg.date) - new Date(response.data.date)) < 1000)
          );
          
          if (!isDuplicate) {
            updatedConversations[activeChat].push(response.data);
          }
          
          return updatedConversations;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
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
                  
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="upload-progress-indicator">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                      <span>{uploadProgress}%</span>
                    </div>
                  )}
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