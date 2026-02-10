package pccit.finalproject.javaclient.ui;

import pccit.finalproject.javaclient.api.ApiClient;
import pccit.finalproject.javaclient.model.LoginResult;
import pccit.finalproject.javaclient.model.User;

import javax.swing.*;
import java.awt.*;
import java.util.List;

/**
 * Main admin window: login/logout, user table, selected user profile panel, delete user.
 * Buttons are enabled/disabled according to current state (requirement 11).
 */
public class AdminFrame extends JFrame {

    private static final String DEFAULT_BASE_URL = "http://localhost:3001";

    private final ApiClient api;
    private boolean loggedIn;

    private final JTextField usernameField;
    private final JPasswordField passwordField;
    private final JButton loginButton;
    private final JButton logoutButton;
    private final JTable userTable;
    private final UserTableModel tableModel;
    private final JButton deleteUserButton;
    private final AvatarPanel avatarPanel;

    public AdminFrame() {
        super("Admin – User Management");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        String baseUrl = System.getProperty("api.baseUrl", DEFAULT_BASE_URL);
        this.api = new ApiClient(baseUrl);
        this.loggedIn = false;

        usernameField = new JTextField(12);
        passwordField = new JPasswordField(12);
        loginButton = new JButton("Login");
        logoutButton = new JButton("Logout");
        tableModel = new UserTableModel();
        userTable = new JTable(tableModel);
        userTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        userTable.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) onSelectionChanged();
        });
        deleteUserButton = new JButton("Delete user");
        avatarPanel = new AvatarPanel();

        buildLayout();
        updateButtonStates();
    }

    private void buildLayout() {
        JPanel north = new JPanel(new FlowLayout(FlowLayout.LEFT, 5, 5));
        north.add(new JLabel("Username:"));
        north.add(usernameField);
        north.add(new JLabel("Password:"));
        north.add(passwordField);
        north.add(loginButton);
        north.add(logoutButton);

        JScrollPane tableScroll = new JScrollPane(userTable);
        tableScroll.setPreferredSize(new Dimension(500, 300));

        JPanel tableAndDelete = new JPanel(new BorderLayout(5, 5));
        tableAndDelete.add(tableScroll, BorderLayout.CENTER);
        JPanel deleteRow = new JPanel(new FlowLayout(FlowLayout.LEFT));
        deleteRow.add(deleteUserButton);
        tableAndDelete.add(deleteRow, BorderLayout.SOUTH);

        JPanel centerWithAvatar = new JPanel(new BorderLayout(10, 0));
        centerWithAvatar.add(tableAndDelete, BorderLayout.CENTER);
        centerWithAvatar.add(avatarPanel, BorderLayout.EAST);

        getContentPane().add(north, BorderLayout.NORTH);
        getContentPane().add(centerWithAvatar, BorderLayout.CENTER);

        loginButton.addActionListener(e -> onLogin());
        logoutButton.addActionListener(e -> onLogout());
        deleteUserButton.addActionListener(e -> onDeleteUser());
    }

    private void onLogin() {
        String username = usernameField.getText();
        String password = new String(passwordField.getPassword());
        loginButton.setEnabled(false);
        SwingWorker<LoginResult, Void> worker = new SwingWorker<>() {
            @Override
            protected LoginResult doInBackground() {
                return api.login(username, password);
            }
            @Override
            protected void done() {
                try {
                    LoginResult result = get();
                    if (result.isSuccess() && result.isAdmin()) {
                        loggedIn = true;
                        loadUsersIntoTable();
                        updateButtonStates();
                    } else {
                        String msg = result.isSuccess()
                                ? "You are not an administrator."
                                : (result.getErrorMessage() != null ? result.getErrorMessage() : "Authentication failed.");
                        JOptionPane.showMessageDialog(AdminFrame.this, msg, "Login failed", JOptionPane.ERROR_MESSAGE);
                        api.logout();
                        loggedIn = false;
                    }
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(AdminFrame.this, "Error: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
                    loggedIn = false;
                }
                updateButtonStates();
            }
        };
        worker.execute();
    }

    private void loadUsersIntoTable() {
        SwingWorker<List<User>, Void> worker = new SwingWorker<>() {
            @Override
            protected List<User> doInBackground() {
                return api.getUsers();
            }
            @Override
            protected void done() {
                try {
                    tableModel.setUsers(get());
                } catch (Exception ex) {
                    tableModel.setUsers(List.of());
                }
                avatarPanel.clearSelection();
                updateButtonStates();
            }
        };
        worker.execute();
    }

    private void onLogout() {
        api.logout();
        loggedIn = false;
        tableModel.clear();
        avatarPanel.clearSelection();
        updateButtonStates();
    }

    private void onSelectionChanged() {
        int row = userTable.getSelectedRow();
        if (row < 0) {
            avatarPanel.clearSelection();
        } else {
            User user = tableModel.getUserAt(row);
            if (user != null) {
                avatarPanel.setSelectedUsername(user.getUsername());
                loadAvatarAsync(user.getId());
            }
        }
        updateButtonStates();
    }

    private void loadAvatarAsync(int userId) {
        api.fetchAvatarAsync(userId, new ApiClient.AvatarCallback() {
            @Override
            public void onAvatarLoaded(byte[] imageBytes) {
                SwingUtilities.invokeLater(() -> {
                    if (userTable.getSelectedRow() >= 0 && tableModel.getUserAt(userTable.getSelectedRow()) != null
                            && tableModel.getUserAt(userTable.getSelectedRow()).getId() == userId) {
                        avatarPanel.setAvatarImage(imageBytes);
                    }
                });
            }
            @Override
            public void onAvatarError(String message) {
                SwingUtilities.invokeLater(() -> avatarPanel.setAvatarError());
            }
        });
    }

    private void onDeleteUser() {
        int row = userTable.getSelectedRow();
        if (row < 0) return;
        User user = tableModel.getUserAt(row);
        if (user == null) return;
        int confirm = JOptionPane.showConfirmDialog(this,
                "Delete user \"" + user.getUsername() + "\"?",
                "Confirm delete",
                JOptionPane.YES_NO_OPTION,
                JOptionPane.QUESTION_MESSAGE);
        if (confirm != JOptionPane.YES_OPTION) return;
        int userId = user.getId();
        deleteUserButton.setEnabled(false);
        SwingWorker<Boolean, Void> worker = new SwingWorker<>() {
            @Override
            protected Boolean doInBackground() {
                return api.deleteUser(userId);
            }
            @Override
            protected void done() {
                try {
                    if (Boolean.TRUE.equals(get())) {
                        tableModel.removeUserAt(row);
                        avatarPanel.clearSelection();
                    } else {
                        JOptionPane.showMessageDialog(AdminFrame.this, "Failed to delete user.", "Error", JOptionPane.ERROR_MESSAGE);
                    }
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(AdminFrame.this, "Error: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
                }
                updateButtonStates();
            }
        };
        worker.execute();
    }

    private void updateButtonStates() {
        loginButton.setEnabled(!loggedIn);
        logoutButton.setEnabled(loggedIn);
        usernameField.setEnabled(!loggedIn);
        passwordField.setEnabled(!loggedIn);
        int row = userTable.getSelectedRow();
        deleteUserButton.setEnabled(loggedIn && row >= 0);
    }
}
