package pccit.finalproject.javaclient.model;

/**
 * Result of a login attempt: either success with admin flag, or failure with error message.
 */
public class LoginResult {
    private final boolean success;
    private final boolean admin;
    private final String errorMessage;

    public static LoginResult success(boolean admin) {
        return new LoginResult(true, admin, null);
    }

    public static LoginResult failure(String errorMessage) {
        return new LoginResult(false, false, errorMessage);
    }

    private LoginResult(boolean success, boolean admin, String errorMessage) {
        this.success = success;
        this.admin = admin;
        this.errorMessage = errorMessage;
    }

    public boolean isSuccess() { return success; }
    public boolean isAdmin() { return admin; }
    public String getErrorMessage() { return errorMessage; }
}
