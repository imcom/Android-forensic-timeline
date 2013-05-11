package imcom.forensics;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import imcom.forensics.extractors.ApplicationsExtractor;
import imcom.forensics.extractors.BrowserHistoryExtractor;
import imcom.forensics.extractors.BrowserSearchesExtractor;
import imcom.forensics.extractors.CallLogExtractor;
import imcom.forensics.extractors.ContactsExtractor;
import imcom.forensics.extractors.MMSExtractor;
import imcom.forensics.extractors.PhoneInfoExtractor;
import imcom.forensics.extractors.SMSExtractor;
import imcom.forensics.extractors.ServiceInfoExtractor;
import imcom.forensics.formats.JsonFormatHelper;

import android.net.Uri;
import android.net.wifi.WifiConfiguration;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.provider.Browser;
import android.provider.CallLog;
import android.provider.ContactsContract;
import android.accounts.Account;
import android.accounts.AccountManager;
import android.app.Activity;
import android.app.ActivityManager;
import android.app.ActivityManager.RunningAppProcessInfo;
import android.app.AlarmManager;
import android.app.DownloadManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.view.Menu;
import android.view.View;
import android.widget.EditText;

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
		startUploadManager();
	}
	
	private void startUploadManager() {
		// TODO Auto-generated method stub
		int repeat_interval = 1 * 1000 * 60 * 60 * 2; // uploading logs every 2 hours
		Intent upload_intent = new Intent(this, UploadManager.class);
		startService(upload_intent);
		PendingIntent pending_intent = PendingIntent.getService(this, 0, upload_intent, 0);
		AlarmManager alarm_manager = (AlarmManager) getSystemService(ALARM_SERVICE);
		alarm_manager.setRepeating(AlarmManager.RTC_WAKEUP, System.currentTimeMillis(), repeat_interval, pending_intent);
	}

	public void launch(View view) {
		Log.d(getString(R.string.imcom_forensics), "captured button click event, proceeding...");
		
		/* Initialize extractors */
		executor = Executors.newFixedThreadPool(THREAD_POOL_SIZE);
		initExtractors();
		
		EditText case_input = (EditText) findViewById(R.id.CaseInput);
		EditText tag_input = (EditText) findViewById(R.id.TagInput);
		
		String case_name = case_input.getText().toString();
		String tag_name = tag_input.getText().toString();
		
		Log.d(getString(R.string.imcom_forensics), "Case: " + case_name + "," + "Tag: " + tag_name);
		EditText console = (EditText) findViewById(R.id.Console);
		console.setText(""); // clear the previous text
		console.append("Started extracting evidence...\n");
		//TODO pump up a warning when the input is empty
		
		AccountManager accounts_manager = (AccountManager) getSystemService(
				Context.ACCOUNT_SERVICE
				);
		Account[] accounts = accounts_manager.getAccounts();
		console.append("----Accounts----\n");
		for (Account account : accounts) {
			console.append(account.name + ":" + account.type + "\n");
		}
		
		ActivityManager activity_manager = (ActivityManager) getSystemService(
				Context.ACTIVITY_SERVICE
				);
		List<RunningAppProcessInfo> runningAppProcesses = activity_manager.getRunningAppProcesses();		
		
		console.append("----Running processes----\n");
		for (RunningAppProcessInfo process_info : runningAppProcesses) {
			console.append(process_info.processName);
			console.append("\n");
		}
		
		console.append("----Saved Wifi Networks----\n");
		WifiManager wifi = (WifiManager) getSystemService(Context.WIFI_SERVICE);
		List<WifiConfiguration> configuredNetworks = wifi.getConfiguredNetworks();
		for (WifiConfiguration configured_network : configuredNetworks) {
			console.append(configured_network.SSID + "\n");
		}
		
		console.append("----Extraction Result----\n");
		/* Proceeding with extraction */
		try {
			SDWriter sd_writer = new SDWriter(this);
			dst_dir = sd_writer.getStorageDirectory(case_name, tag_name);
			
			TemporalInfoGatherer temporal_info_gatherer = new TemporalInfoGatherer("temporal.pjson");
			temporal_info_gatherer.gather(dst_dir);
			
			DownloadManager download_manager = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
			DownloadHistoryGatherer download_history_gatherer = new DownloadHistoryGatherer("downloads.pjson");
			download_history_gatherer.gather(download_manager, dst_dir);
			
			extract();
			terminate();
		} catch (TimelineException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	private void initExtractors() {
		
		Extractor apps_extractor = new ApplicationsExtractor("Applications");
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
		
		Extractor service_info_extractor = new ServiceInfoExtractor("ServiceInfo");
		extractors.add(service_info_extractor);
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
					String res_message = "Extracted " + res_number + " " + extractor.getExtractorName() + "\n";
					Log.d(getString(R.string.imcom_forensics), res_message);
					updateConsoleText(res_message);		
				}
			});
		}
	}
	
	private synchronized void updateConsoleText(String text) {
		EditText console = (EditText) findViewById(R.id.Console);
		console.append(text);
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.activity_main, menu);
		return true;
	}

}
