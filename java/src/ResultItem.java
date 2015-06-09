public class ResultItem {
    private String expected;
    private String actual;
    private boolean success;

    public ResultItem(String expected, String actual, boolean success) {
        this.expected = expected;
        this.actual = actual;
        this.success = success;
    }

    public String getExpected() {
        return expected;
    }

    public String getActual() {
        return actual;
    }

    public boolean isSuccess() {
        return success;
    }
}
