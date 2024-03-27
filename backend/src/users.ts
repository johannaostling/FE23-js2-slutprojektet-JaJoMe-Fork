import { readDatabase, writeDatabase } from "./handledatabase.js";
import { User, UserWithoutPassword, Post, Comment } from "./Types.js";
// get all users
async function getUsers(): Promise<User[]> {
  const db = await readDatabase();
  return db.users;
}
async function getUsersWithoutPassword(): Promise<UserWithoutPassword[]> {
  const db = await readDatabase();
  const usersWithoutPasswords: UserWithoutPassword[] = [];
  for (const user of db.users) {
    const { password, ...userWithoutPasswords } = user;
    usersWithoutPasswords.push(userWithoutPasswords);
  }
  return usersWithoutPasswords;
}
// get individuel user
// url id is user.id
async function getUser(
  id: string
): Promise<UserWithoutPassword | { message: string }> {
  const users = await getUsersWithoutPassword();
  const user = users.find((user: User) => user.id == id);
  if (user) return user;
  else return { message: "user not found" };
}
// get login
// json format for this is
// {
//     "name": "username",
//     "password": "password"
// }
async function logIn(
  userName: string,
  userPassword: string
): Promise<UserWithoutPassword | { message: string }> {
  const users = await getUsers();
  console.log(users);
  console.log(userName, userPassword);
  for (const user of users) {
    if (
      user.name === userName.toLowerCase() &&
      (user as User).password === userPassword
    ) {
      const { password, ...userWithoutPassword } = user as User;
      console.log(userWithoutPassword);
      return userWithoutPassword;
    }
  }
  return { message: "user not found" };
}
// dont return user.password

// get comments eller posts //! funkar
// json format for this is:
// {
//     "userId": "user.id",
//     "dataType": "posts"| "comments"
// }
async function getUserData(
  userId: string,
  dataType: string
): Promise<Comment[] | Post[] | { message: string }> {
  const user = await getUser(userId);
  if ("comments" in user && "posts" in user) {
    if (dataType === "comments") {
      return user.comments;
    } else if (dataType === "posts") {
      return user.posts;
    }
  }
}

// add new user
//! funkar
// json format for this is:
// {
//     "name":"name",
//     "password":"password",
//     "image":"src for img"
// }
async function addUser(user: User): Promise<UserWithoutPassword> {
  const users = await getUsers();

  const existingName = users.find(
    (existingName) =>
      existingName.name.toLowerCase() === user.name.toLowerCase()
  );
  if (existingName) {
    throw new Error("User with that name already exists");
  }

  const id = crypto.randomUUID();
  const newUser: User = {
    id,
    name: user.name.toLowerCase(),
    password: user.password,
    image: user.image,
    admin: false,
    comments: [],
    posts: [],
  };
  users.push(newUser);
  await writeDatabase(users);
  const { password, ...userWithoutPassword } = newUser;
  console.log(userWithoutPassword);
  return userWithoutPassword;
}

// delete user from database //! funkar
// url id is user.id
async function deleteUser(id: string): Promise<void> {
  const user = await getUser(id);
  if (!user) throw new Error("User not found");
  const users = await getUsers();
  const updatedDatabase = users.filter((u) => u.id !== id);
  await writeDatabase(updatedDatabase);
}

export { getUser, getUsers, logIn, getUserData, deleteUser, addUser };
