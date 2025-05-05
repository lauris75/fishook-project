import "./RightBar.scss"

const RightBar = () => {
  return (
    <div className="rightBar">
      <div className="container">
        <div className="friends">
          <p>Following</p>
          <div className="friend">
            <img
              src="https://images.unsplash.com/photo-1609818902866-a1076a14484a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
              alt=""
            />
            <span>Ben Smith</span>
          </div>
          <div className="friend">
            <img
              src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt=""
            />
            <span>Jane Doe</span>
          </div>
          <div className="friend">
            <img
              src="https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=934&q=80"
              alt=""
            />
            <span>John Doe</span>
          </div>
        </div>
        <div className="groups">
          <p>Your groups</p>
          <div className="group">
            <img
              src="https://images.unsplash.com/photo-1529230117010-b6c436154f25?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
              alt=""
            />
            <span>FawAway</span>
          </div>
          <div className="group">
            <img
              src="https://images.unsplash.com/photo-1551131618-3f0a5cf594b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80"
              alt=""
            />
            <span>Group catchers</span>
          </div>
          <div className="group">
            <img
              src="https://images.unsplash.com/photo-1592929043000-fbea34bc8ad5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              alt=""
            />
            <span>Baits</span>
          </div>
          <div className="group">
            <img
              src="https://images.unsplash.com/photo-1537872384762-e785271d14f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80"
              alt=""
            />
            <span>Caribbean Sea</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RightBar