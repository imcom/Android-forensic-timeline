package imcom.forensics;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import android.app.DownloadManager;
import android.database.Cursor;
import android.util.Log;

public class DownloadHistoryGatherer {

	private static final String LOG_TAG = "IMCOM-DownloadHistory";
	private String DOWNLOAD_HISTORY_FILENAME;
	private static final String GATHERER_NAME = "DownloadHistory";
	protected FormatHelper helper;
	
	public DownloadHistoryGatherer(String download_history_filename) {
		// TODO Auto-generated constructor stub
		this.DOWNLOAD_HISTORY_FILENAME = download_history_filename;
		Log.d(LOG_TAG, GATHERER_NAME + " launches");
	}

	public void gather(DownloadManager download_manager, File dst_dir) {

		DownloadManager.Query query = new DownloadManager.Query();
		query = query.setFilterByStatus(
				DownloadManager.STATUS_FAILED |
				DownloadManager.STATUS_PAUSED |
				DownloadManager.STATUS_PENDING |
				DownloadManager.STATUS_RUNNING |
				DownloadManager.STATUS_SUCCESSFUL
		);
		Cursor cursor = download_manager.query(query); //FIXME the cursor is always empty
		
		if (cursor != null && cursor.moveToFirst()) {
			try {
				BufferedWriter download_history_writer = new BufferedWriter(
						new FileWriter(
								new File(dst_dir, DOWNLOAD_HISTORY_FILENAME)
								)
						);
				
				String[] col_names = cursor.getColumnNames();
				int records_num = cursor.getCount();
				int col_num = cursor.getColumnCount();

				do {
					StringBuilder extracted_item = new StringBuilder();
					for (int index = 0; index < col_num; ++index) {	
						String field_value = EscapeWrapper.nomarlize(cursor.getString(index));
						String formatted_field = helper.formatString(col_names[index], field_value);
						extracted_item.append(formatted_field);
						extracted_item.append(" ");
					}
					download_history_writer.write(extracted_item.toString().trim());			
					if (!cursor.isLast()) download_history_writer.newLine();
					
				} while (cursor.moveToNext());

				if (download_history_writer != null) download_history_writer.close();
				
				Log.d(LOG_TAG, GATHERER_NAME + " - fetches " + records_num + " records");

			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				Log.e(LOG_TAG, e.getMessage());

			} finally {
				if (cursor != null) cursor.close();
			}
		} else {
			Log.d(LOG_TAG, GATHERER_NAME + " - Empty query... [DownloadManager]");
		}
	}

}
