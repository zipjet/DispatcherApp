package com.zipjet.dispatcher;

import com.facebook.react.ReactActivity;

import android.view.KeyEvent;
import android.view.View;
import android.widget.Toast;

import com.github.kevinejohn.keyevent.KeyEventModule;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "INTWASH3";
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {

        // A. Prevent multiple events on long button press
        //    In the default behavior multiple events are fired if a button
        //    is pressed for a while. You can prevent this behavior if you
        //    forward only the first event:
        //        if (event.getRepeatCount() == 0) {
        //            KeyEventModule.getInstance().onKeyDownEvent(keyCode, event);
        //        }
        //
        // B. If multiple Events shall be fired when the button is pressed
        //    for a while use this code:
        //        KeyEventModule.getInstance().onKeyDownEvent(keyCode, event);
        //
        // Using B.

        int diff = (char) event.getUnicodeChar() - '0';
        KeyEventModule.getInstance().onKeyDownEvent(diff, event);

        // There are 2 ways this can be done:
        //  1.  Override the default keyboard event behavior
        //    super.onKeyDown(keyCode, event);
        //    return true;

        //  2.  Keep default keyboard event behavior
        //    return super.onKeyDown(keyCode, event);

//        Toast.makeText(this, Character.toString((char) event.getUnicodeChar()), Toast.LENGTH_SHORT).show();

        // Using method #1 without blocking multiple
        super.onKeyDown(keyCode, event);
        return true;
    }

    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {

        int diff = (char) event.getUnicodeChar() - '0';
        KeyEventModule.getInstance().onKeyUpEvent(diff, event);

        // There are 2 ways this can be done:
        //  1.  Override the default keyboard event behavior
        //    super.onKeyUp(keyCode, event);
        //    return true;

        //  2.  Keep default keyboard event behavior
        //    return super.onKeyUp(keyCode, event);

        // Using method #1
        super.onKeyUp(keyCode, event);
        return true;
    }

    @Override
    public boolean onKeyMultiple(int keyCode, int repeatCount, KeyEvent event) {
        KeyEventModule.getInstance().onKeyMultipleEvent(keyCode, repeatCount, event);
        return super.onKeyMultiple(keyCode, repeatCount, event);
    }
}
