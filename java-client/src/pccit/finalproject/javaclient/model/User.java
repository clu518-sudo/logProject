package pccit.finalproject.javaclient.model;

/**
 * Represents a user as returned by the admin users API.
 */
public class User {
    private final int id;
    private final String username;
    private final String realName;
    private final String dob;
    private final String bio;
    private final String avatarType;
    private final String avatarKey;
    private final String avatarPath;
    private final boolean admin;
    private final int articleCount;

    public User(int id, String username, String realName, String dob, String bio,
                String avatarType, String avatarKey, String avatarPath, boolean admin, int articleCount) {
        this.id = id;
        this.username = username != null ? username : "";
        this.realName = realName != null ? realName : "";
        this.dob = dob != null ? dob : "";
        this.bio = bio != null ? bio : "";
        this.avatarType = avatarType != null ? avatarType : "";
        this.avatarKey = avatarKey != null ? avatarKey : "";
        this.avatarPath = avatarPath != null ? avatarPath : "";
        this.admin = admin;
        this.articleCount = articleCount;
    }

    public int getId() { return id; }
    public String getUsername() { return username; }
    public String getRealName() { return realName; }
    public String getDob() { return dob; }
    public String getBio() { return bio; }
    public String getAvatarType() { return avatarType; }
    public String getAvatarKey() { return avatarKey; }
    public String getAvatarPath() { return avatarPath; }
    public boolean isAdmin() { return admin; }
    public int getArticleCount() { return articleCount; }
}
