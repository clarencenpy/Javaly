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
        String stacktrace = sw.toString();
        //strip the trace from Tester classes onward
        int index = stacktrace.indexOf("at Test.run");
        return stacktrace.substring(0,index).trim();
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

}
