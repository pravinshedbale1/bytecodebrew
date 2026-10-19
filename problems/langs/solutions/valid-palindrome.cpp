class Solution {
public:
    bool isPalindrome(string s) {
        int i = 0, j = (int) s.size() - 1;
        while (i < j) {
            if (!isalnum((unsigned char) s[i])) i++;
            else if (!isalnum((unsigned char) s[j])) j--;
            else if (tolower(s[i++]) != tolower(s[j--])) return false;
        }
        return true;
    }
};
