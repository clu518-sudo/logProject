# Java Swing Admin Client

Administrator UI for the project backend. Built with Java Swing; communicates with the Node.js API over HTTP.

## Requirements

- **Java 11 or later** (uses `java.net.http.HttpClient` and Swing).
- Backend running (default: `http://localhost:3001`).

## Build and run

From the `java-client` directory:

```bash
# Compile
javac -d out -sourcepath src src/pccit/finalproject/javaclient/Main.java

# Run
java -cp out pccit.finalproject.javaclient.Main
```

To use a different API base URL:

```bash
java -Dapi.baseUrl=http://localhost:3001 -cp out pccit.finalproject.javaclient.Main
```

## Features

- **Login / Logout** with username and password. Only admin users can see the user list; others get an error and are logged out.
- **User table** lists ID, username, real name, admin flag, and article count.
- **Selected user panel** shows username and profile image (thumbnail, loaded asynchronously).
- **Delete user** removes the selected user on the server and from the table.
- Buttons are enabled only when their action is valid (e.g. Login when not logged in, Delete when a row is selected).

Design: MVC for the table (`UserTableModel`), observer for selection, and background workers for login, user list, avatar, and delete so the UI stays responsive.
