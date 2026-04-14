# Feature Voting Board

A simple, modern feature voting board built purely with HTML, CSS, and JavaScript. This tool simulates how product teams use user input to decide what to build next (e.g., Canny, ProductBoard).

## Features
- Displays 5 default product features.
- Sleek modern dark mode UI.
- Upvote features in real-time.
- Features automatically re-rank based on vote counts.
- Add your own custom feature requests.
- All data is persisted locally in the browser using `localStorage`.

## How to use
Simply open `index.html` in any modern web browser to interact with the board. No build steps or servers required.

## Product Manager Bonus Note

If I were a Product Manager reviewing this board, here is how I would prioritize shipping these features, regardless of the raw vote count:

1. **API Integrations (Zapier, Slack)** 
   - *Why ship this first?* While "Mobile App" might have more votes, API integrations unlock ecosystem network effects. By connecting our app to tools teams already use (like Slack and Zapier), we reduce churn and increase workflow dependency for B2B customers. It's often cheaper to build than a whole mobile app and yields immediate enterprise value.
   
2. **Mobile App (iOS/Android)**
   - *Why ship this second?* It has the highest user demand (215 votes). While expensive, if our platform relies on on-the-go data entry or notifications, this is a major blocker to adoption that we need to unblock.

3. **Analytics Dashboard**
   - *Why ship this third?* Users want to prove the ROI of using our tool. A dashboard gives them the metrics they need to justify their subscription to their boss.

4. **Custom User Roles**
   - *Why ship this fourth?* Enterprise and larger teams need this for security and compliance. It's a key feature for moving upmarket and securing higher tier subscriptions. 

5. **Dark Mode Support**
   - *Why ship this last?* Although highly requested and a great "delighter" feature, it rarely moves the needle on core business metrics (conversion, retention, or MRR) compared to the others. It should be built during a cool-down sprint.
