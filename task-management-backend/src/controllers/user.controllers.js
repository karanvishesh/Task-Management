import APIError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.models.js";
import APIResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

async function getAccessAndRefreshToken(userId) {
  const user = await User.findById(userId);
  if (!user) throw APIError(401, "Invalid User");
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  return { refreshToken, accessToken };
}

const getAllUsers = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.role !== 'Super Admin' || user.email !== "SuperAdmin@gmail.com") {
    return res.status(403).json({ message: "Access denied" });
  }

  const users = await User.find({}, { _id : 1,fullName: 1, email: 1, role : 1 });
  res
    .status(200)
    .json(new APIResponse(201, users, "Fetched All Users Successfully"));
})
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  if ([email, password, fullName].some((field) => !field.trim())) {
    throw new APIError(400, "All Fields are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new APIError(409, "User already exists");
  }
  const user = await User.create({
    fullName,
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) throw new APIError(500, "Internal Server Error");

  res
    .status(200)
    .json(new APIResponse(201, createdUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) throw new APIError(401, "Invalid Email or password");

  const loggedInUser = await User.findOne({ email });
  if (!loggedInUser) throw new APIError(401, "Invalid Email or password");

  const isPasswordValid = await loggedInUser.verifyPassword(password);
  if (!isPasswordValid) throw new APIError(401, "Invalid Email or password");

  const options = {
    httpOnly: true,
    secure: true,
  };

  const { accessToken, refreshToken } = await getAccessAndRefreshToken(
    loggedInUser._id
  );

  await User.updateOne(
    { _id: loggedInUser._id },
    { $set: { refreshToken: refreshToken } }
  );

  const userToReturn = await User.findById(loggedInUser._id).select(
    "-password -refreshToken"
  );

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new APIResponse(
        200,
        {
          user: userToReturn,
          refreshToken,
          accessToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await User.updateOne(
    { _id: userId },
    { $unset: { refreshToken: 1 } },
    {
      new: true,
    }
  );
  const options = {
    HttpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new APIResponse(200, {}, "User logged Out"));
});

const updateUserRole = async (req, res) => {
  const user = req.user;
  if (user.role !== 'Super Admin' || user.email !== "SuperAdmin@gmail.com") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { userId, role } = req.body;

  if (!["Admin", "User"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  try {
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }
    userToUpdate.role = role;
    await userToUpdate.save();

    res
      .status(200)
      .json({ message: "User role updated successfully", user: userToUpdate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshAccessToken || req.body.refreshToken;
    if (!incomingRefreshToken) throw APIError(401, "Unauthorized Request");

    const decodedData = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!decodedData) throw APIError(401, "Invalid Refresh token");

    const user = await User.findById(decodedData._id);

    if (!user) throw APIError(401, "User doesn't exist");

    if (incomingRefreshToken != user.refreshAccessToken)
      throw APIError(401, "Invalid Refresh token");

    const { accessToken, newRefreshAccessToken } = getAccessAndRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshAccessToken, options)
      .json(
        new APIResponse(
          200,
          { accessToken, newRefreshAccessToken },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new APIError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword && !newPassword) throw new APIError(401, "Invalid Password");
  const user = await User.findById(req.user._id);
  if (!user) throw new APIError(401, "User doesn't exist");
  const isPasswordValid = await user.verifyPassword(oldPassword);
  if (!isPasswordValid) throw new APIError("401", "Incorrect Password");
  user.password = newPassword;
  await user.save({ ValidateBeforeSave: false });
  return res
    .status(200)
    .json(new APIResponse(200, {}, "Password changed successfully"));
});

const getUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new APIError(404, "User not found");
  res
    .status(200)
    .json(new APIResponse(200, user, "User returned Successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName && !email) throw new APIError(400, "Provide atlease one field to update");
  const user = req.user;
  if(fullName)
  user.fullName = fullName;
  if(email)
  user.email = email;
  await user.save({ ValidateBeforeSave: false });
  res
    .status(200)
    .json(new APIResponse(200, user, "Account details updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getUser,
  updateUserRole,
  updateAccountDetails,
  getAllUsers
};
