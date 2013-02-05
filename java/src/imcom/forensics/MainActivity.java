package imcom.forensics;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import imcom.forensics.extractors.ApplicationExtractor;
import imcom.forensics.extractors.BrowserHistoryExtractor;
import imcom.forensics.extractors.BrowserSearchesExtractor;
import imcom.forensics.extractors.CallLogExtractor;
import imcom.forensics.extractors.ContactsExtractor;
import imcom.forensics.extractors.MMSExtractor;
import imcom.forensics.extractors.PhoneInfoExtractor;
import imcom.forensics.extractors.SMSExtractor;
import imcom.forensics.formats.JsonFormatHelper;

import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.net.wifi.WifiConfiguration;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.provider.Browser;
import android.provider.CallLog;
import android.provider.ContactsContract;
import android.app.Activity;
import android.app.ActivityManager;
import android.app.ActivityManager.RunningAppProcessInfo;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;
import android.view.Menu;

public class MainActivity extends Activity {
	
	private static ExecutorService executor;
	private static final int THREAD_POOL_SIZE = 8;
	private static final ThreadLocal<FormatHelper> format_helper_pool = new ThreadLocal<FormatHelper>();
	private static ArrayList<Extractor> extractors = new ArrayList<Extractor>();
	private static File dst_dir;
	
	private final String SMS_URI = "content://sms";
	private final String MMS_URI = "content://mms";
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		
		/* Initialize extractors */
		executor = Executors.newFixedThreadPool(THREAD_POOL_SIZE);
		initExtractors();
		
		ActivityManager am = (ActivityManager) this.getSystemService(Context.ACTIVITY_SERVICE);
		
		List<RunningAppProcessInfo> runningAppProcesses = am.getRunningAppProcesses();
		Iterator<RunningAppProcessInfo> it = runningAppProcesses.iterator();
		while(it.hasNext()) {
			RunningAppProcessInfo appp = (RunningAppProcessInfo) it.next();
			Log.d("app process", appp.processName);
		}
		
		/* Proceeding with extraction */
		try {
			SDWriter sd_writer = new SDWriter(this);
			dst_dir = sd_writer.getStorageDirectory("android_timeline", "gama");
			
			SystemInfoGatherer gatherer = new SystemInfoGatherer("system.config");
			gatherer.gather(dst_dir);
			
			//extract();
			//terminate();
		} catch (TimelineException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	private void initExtractors() {
		
		Extractor apps_extractor = new ApplicationExtractor("Applications");
		extractors.add(apps_extractor);
		
		Extractor contacts_extractor = new ContactsExtractor("Contacts");
		contacts_extractor.setContentUri(ContactsContract.Contacts.CONTENT_URI);
		extractors.add(contacts_extractor);
		
		Extractor calllog_extractor = new CallLogExtractor("CallLog");
		calllog_extractor.setContentUri(CallLog.Calls.CONTENT_URI);
		extractors.add(calllog_extractor);
		
		Extractor sms_extractor = new SMSExtractor("SMS");
		sms_extractor.setContentUri(Uri.parse(this.SMS_URI));
		extractors.add(sms_extractor);
		
		Extractor mms_extractor = new MMSExtractor("MMS");
		mms_extractor.setContentUri(Uri.parse(this.MMS_URI));
		extractors.add(mms_extractor);
		
		Extractor browser_history_extractor = new BrowserHistoryExtractor("BrowserHistory");
		browser_history_extractor.setContentUri(Browser.BOOKMARKS_URI);
		extractors.add(browser_history_extractor);
		
		Extractor browser_searches_extractor = new BrowserSearchesExtractor("BrowserSearches");
		browser_searches_extractor.setContentUri(Browser.SEARCHES_URI);
		extractors.add(browser_searches_extractor);
		
		Extractor phone_info_extractor = new PhoneInfoExtractor("PhoneInfo");
		extractors.add(phone_info_extractor);
	}
	
	private void terminate() {
		executor.shutdown();
		try {
			executor.awaitTermination(24, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	private void extract() {
		for (final Extractor extractor : extractors) {
			executor.submit(new Runnable(){

				@Override
				public void run() {
					// TODO Auto-generated method stub
					if (format_helper_pool.get() == null) {
						format_helper_pool.set(new JsonFormatHelper("json", ':'));
					}
					extractor.setFormat(format_helper_pool.get());
					int res_number = extractor.extract(
							getContentResolver(), 
							getApplicationContext(), 
							dst_dir);
					Log.d("main::extract", "Extracted " + res_number + " " + extractor.getExtractorName());
				}
				
			});
		}
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.activity_main, menu);
		return true;
	}

}
