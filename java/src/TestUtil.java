import org.junit.Assert;

import java.io.*;


public class TestUtil {

    public static String captureSystemOutput(ByteArrayOutputStream outContent) {
        String actualOutput = outContent.toString();
        outContent.reset(); //clearing the ByteArrayOutputStream, or future calls will show duplicated data
        return removeTrailingNewLine(actualOutput);
    }

    public static String captureStacktrace(Exception e) {
        StringWriter sw = new StringWriter();
        e.printStackTrace(new PrintWriter(sw));
        return sw.toString();
    }

    public static String removeTrailingNewLine(String s) {
        int length = s.length();
        char c = s.charAt(length-1);
        if (c == '\n') {
            return s.substring(0, length-1);
        } else {
            return s;
        }
    }

    public static Result assertEquals(Object o1, Object o2) {
        try {
            Assert.assertEquals(o1, o2);
            return new Result(o1.toString(), o2.toString(), true);
        } catch (AssertionError e) {
            return new Result(o1.toString(), o2.toString(), false);
        }
    }

    public static Result assertEquals(int a, int b) {
        try {
            Assert.assertEquals(a, b);
            return new Result(a+"", b+"", true);
        } catch (AssertionError e) {
            return new Result(a+"", b+"", false);
        }
    }
}
