const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
// const mongodb = require("mongodb");
// console.log(mongodb);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://admin:admin@cluster0.1cppf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    console.log("Connected to dataBase");
  } catch (error) {
    console.log(`Error ${error.message}`);
  }
}
main().catch(console.error);

async function checkUserExistOrNot(id) {
  return await client
    .db("myFirstDatabase")
    .collection("users")
    .findOne({ _id: ObjectId(id) });
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Create user
app.post("/api/users", async (req, res) => {
  try {
    await client.db("myFirstDatabase").collection("users").insertOne(req.body);
    res.setHeader("content-type", "application/json");
    res.status(201).json({ status: "success", data: req.body });
  } catch (error) {
    console.log(`Error: ${error.message}`);
    res.status(404).json({ status: "error", error: error.message });
  }
});

// get users
app.get("/api/users", async (req, res) => {
  try {
    const userData = await client
      .db("myFirstDatabase")
      .collection("users")
      .find();
    const users = await userData.toArray();
    res.setHeader("content-type", "application/json");
    res
      .status(200)
      .json({ status: "success", data: { count: users.length, users } });
  } catch (error) {
    console.log(`Error ${error.message}`);
    res.status(404).json({ status: "error", error: error.message });
  }
});

// get user by id
app.get("/api/users/:userId", async (req, res) => {
  try {
    const id = req.params.userId;
    if (ObjectId.isValid(id)) {
      const user = await checkUserExistOrNot(id);

      if (user !== null) {
        // res.setHeader("content-type", "application/json")
        res.status(201).json({ status: "success", data: { user } });
      } else {
        res.status(404).json({
          status: "error",
          data: { msg: `This id: ${id} is not exist in database` },
        });
      }
    } else {
      res.status(404).json({ status: "error" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(404).json({ status: "error", error: error.message });
  }
});

// update user by
app.put("/api/users/:userId", async (req, res) => {
  try {
    const id = req.params.userId;
    if (ObjectId.isValid(id)) {
      const user = await checkUserExistOrNot(id);
      if (user !== null) {
        await client
          .db("myFirstDatabase")
          .collection("users")
          .updateOne({ _id: ObjectId(id) }, { $set: req.body });

        const updatedUser = await checkUserExistOrNot(id);
        res.status(201).json({ status: "success", data: updatedUser });
      } else {
        res.status(404).json({ status: "error" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
});

// Delete user by id

app.delete("/api/users/:userId", async (req, res) => {
  try {
    const id = req.params.userId;
    if (ObjectId.isValid(id)) {
      const user = await checkUserExistOrNot(id);
      if (user !== null) {
        await client
          .db("myFirstDatabase")
          .collection("users")
          .deleteOne({ _id: ObjectId(id) });
          res.status(201).json({status:"succes", data:{msg:`This ${id} is successfully delted`}})
      } else {
        res.status(404).json({status:"error", data:{msg:`This ${id} is not exist in database`}})
      }
    } else {
      res.status(404).json({status:"error"})
    }
  } catch (error) {
    console.log(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Main ke ander call vale functions
// await getAllDatabases(client);
// await createDatabase(client, {
//   firstName: "Ahmed",
//   lastName: "sheikh",
//   age: 24,
//   gender: "male",
// });
// await deleteOne(client, {
//   lastName:"sheikh"
// })

// await createManyDatabases(client, [
//   {
//     firstName: "suraj",
//     lastName: "khatak",
//     age: 22,
//     gender: "male",
//   },
//   {
//     firstName: "videsh",
//     lastName: "kaesar",
//     age: 22,
//     gender: "male",
//   },
// ]);

// Function jo humne create kye hein to uderstand mongodb commands

// async function getAllDatabases(client) {
//   const dataBaseList1 = await client.db().admin().listDatabases();
//   // console.log(dataBaseList);
//   console.log("DataBases: ");
//   dataBaseList1.databases.forEach((db, i) => {
//     console.log(`${i} - ${db.name}`);
//   });
// }

// async function createDatabase(client, newLising) {
//   const result = await client
//     .db("myFirstDatabase")
//     .collection("users")
//     .insertOne(newLising);
//   // console.log("result",result);
//   console.log(`New Listing has been created with ${result.insertedId}`);
// }

// async function createManyDatabases(client, newLising) {
//   const result = await client
//     .db("myFirstDatabase")
//     .collection("users")
//     .insertMany(newLising);
//   console.log("result", result);
//   console.log(
//     `Successfully created user with ${result.insertedIds} , number of edited ${result.insertedCount}`
//   );
// }

// async function deleteOne(client, deleteListing) {
//   const result = await client
//     .db("myFirstDatabase")
//     .collection("users")
//     .deleteOne(deleteListing);
//     // console.log(result);
//   console.log(`sucessfully delete with ${result.deletedCount}`);
// }
