import { Client, Databases, Account } from "appwrite";

const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67fd12b0003328d94b7d"); // my project ID

export const account = new Account(client);
export const databases = new Databases(client);
