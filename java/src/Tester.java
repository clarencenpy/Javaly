import org.junit.*;

public class Tester {
    private ResultSet resultSet = new ResultSet();

    public void assertEquals(Object o1, Object o2) {
        try {
            Assert.assertEquals(o1, o2);
            resultSet.add(new Result(String.valueOf(o1), String.valueOf(o2), true));
        } catch (AssertionError e) {
            resultSet.add(new Result(String.valueOf(o1), String.valueOf(o2), false));
        }
    }

    public void assertEquals(String description, Object o1, Object o2) {
        try {
            Assert.assertEquals(o1, o2);
            resultSet.add(new Result(description, String.valueOf(o1), String.valueOf(o2), true));
        } catch (AssertionError e) {
            resultSet.add(new Result(description, String.valueOf(o1), String.valueOf(o2), false));
        }
    }

    public void addResult(Object expectedOutput, Object actualOutput, boolean success) {
        resultSet.add(new Result(String.valueOf(expectedOutput), String.valueOf(actualOutput), success));
    }

    public void addResult(String description, Object expectedOutput, Object actualOutput, boolean success) {
        resultSet.add(new Result(description, String.valueOf(expectedOutput), String.valueOf(actualOutput), success));
    }

    public ResultSet getResultSet() {
        return resultSet;
    }
}
