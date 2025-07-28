import User from "../models/User.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("followers")
      .populate("following");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error fetching profile" });
  }
};

export const followUser = async (req, res) => {
  try {
    
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) return res.status(404).json({ error: "User not found" });

    
    if (userToFollow.followers.includes(currentUser._id)) {
      userToFollow.followers.pull(currentUser._id);
      currentUser.following.pull(userToFollow._id);
    } else {
      userToFollow.followers.push(currentUser._id);
      currentUser.following.push(userToFollow._id);
    }

    await userToFollow.save();
    await currentUser.save();

    res.json({ message: "Follow status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating follow status" });
  }
};
