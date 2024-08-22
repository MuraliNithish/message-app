import React, { useState, useEffect, useRef } from "react";

// Define the Message type
type Message = {
  name: string;
  content: string;
  time: string;
  sender: boolean; // true if the message is sent by the current user, false if received
  type: "text" | "image" | "file"; // Message type: text, image, or file
};

const MessageSystem: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const [userName, setuserName] = useState<string | null>(null);

  useEffect(() => {
    if (!userName) {
      const name = prompt("Enter your Name");
      setuserName(name || "Sathish");
    }
    const websocket = new WebSocket("ws://localhost:5001");
    ws.current = websocket;

    websocket.onopen = () => {
      console.log("WebSocket connection opened");
    };

    websocket.onmessage = (event) => {
      if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result as string);
            if (Array.isArray(data)) {
              data.forEach((message: any) => handleIncomingMessage({ message }));
            } else {
              handleIncomingMessage(data);
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };
        reader.readAsText(event.data);
      } else {
        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data)) {
            data.forEach((message: any) => handleIncomingMessage({ message }));
          } else {
            handleIncomingMessage(data);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      }
    };
    

    websocket.onerror = (event) => {
      console.log("WebSocket error occurred:", event);
    };

    websocket.onclose = (event) => {
      console.log("WebSocket connection closed", event);
    };

    return () => {
      websocket.close();
    };
  }, []);

  const handleIncomingMessage = (data: any) => {
    console.log("Incoming data:", data);
  
    if (data.message) {
      const newMessage: Message = {
        name: data.message.name || "Unknown",
        content: data.message.content || "",
        time:
          data.message.time ||
          new Date().toISOString().slice(0, 19).replace("T", " "),
        sender: data.message.sender === userName,
        type: data.message.type || "text",
      };
  
      setMessages((prevMessages) => {
        // Check if the message already exists
        const exists = prevMessages.some(
          (msg) => msg.content === newMessage.content && msg.time === newMessage.time
        );
        if (!exists) {
          return [...prevMessages, newMessage];
        }
        return prevMessages;
      });
    }
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (ws.current) {
      ws.current.send(
        JSON.stringify({
          type: "typing",
          typingStatus: "Typing...",
          user: userName,
        })
      );
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        name: userName ?? "",
        content: inputValue,
        time: new Date().toISOString().slice(0, 19).replace("T", " "),
        sender: true,
        type: "text",
      };

      // setMessages(prevMessages => [...prevMessages, newMessage]);

      try {
        await fetch("http://localhost:5001/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMessage),
        });

        if (ws.current) {
          ws.current.send(
            JSON.stringify({ type: "message", message: newMessage })
          );
        }

        setInputValue("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileInput(file);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:5001/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          const fileUrl = result.fileUrl;

          const newMessage: Message = {
            name: userName ?? "",
            content: fileUrl,
            time: new Date().toISOString().slice(0, 19).replace("T", " "),
            sender: true,
            type: file.type.startsWith("image/") ? "image" : "file",
          };

          // setMessages((prevMessages) => [...prevMessages, newMessage]);
          if (ws.current) {
            ws.current.send(
              JSON.stringify({ type: "message", message: newMessage })
            );
          }
        } else {
          console.error("File upload failed");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  return (
    <div className="flex-grow mb-4 p-4 ml-64 mt-20 flex flex-col h-[calc(100vh-5rem)]">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-[700] mb-5 text-[#232323] flex items-center space-x-2">
          <span>Message System</span>
        </div>
      </div>
      <div className="flex flex-col flex-grow overflow-hidden">
        <div className="flex flex-col flex-grow overflow-hidden">
          <div className="flex items-center ml-5 p-4 border h-[80px] w-[90%] bg-[#ffffff] shadow-md">
            <img
              className="p-2 mr-7 ml-2 bg-[#fbfbfb] w-10 h-10 rounded-md"
              src="/assets/arrow.svg"
              alt="Arrow"
            />
            <img
              className="w-12 h-12 mr-4"
              src="/assets/sathish.svg"
              alt="User"
            />
            <div>
              <p className="text-base font-medium">Sathish</p>
              <span className="text-sm text-green-500">Online</span>
            </div>
          </div>
          <div className="flex-1 ml-5 p-4 bg-[#f6f6f8] w-[90%] overflow-y-auto flex-grow">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${
                  message.name === userName ? "justify-end" : "justify-start"
                } mb-4`}
              >
                {!(message.name === userName) && (
                  <>
                    <img
                      src="/assets/sathish.svg"
                      alt="User"
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  </>
                )}
                <div
                  className={`p-2 rounded-lg ${
                    message.name === userName
                      ? "bg-blue-500 text-white"
                      : "bg-white text-black"
                  } ${message.sender ? "ml-2" : "mr-2"} max-w-[60%]`}
                >
                  {!(message.name === userName) && (
                    <p className="font-bold mb-1">{message.name}</p>
                  )}
                  {message.type === "image" ? (
                    <img
                      src={message.content}
                      alt="Sent file"
                      className="w-full h-auto rounded-lg"
                    />
                  ) : (
                    <p>{message.content}</p>
                  )}
                  <p className="text-xs text-gray-500">{message.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center ml-5 mb-4 p-4 border h-[65px] w-[90%] bg-[#ffffff] shadow-md">
        <label
          htmlFor="file-upload"
          className="p-2 mr-2 bg-white w-10 h-10 cursor-pointer"
        >
          <img className="w-full h-full" src="/assets/plus.svg" alt="Plus" />
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type Here"
          className="text-sm font-medium text-gray-400 flex-grow outline-none"
        />
        <img
          className="p-2 bg-white w-14 h-14 cursor-pointer"
          src="/assets/ws.svg"
          alt="Send"
          onClick={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default MessageSystem;