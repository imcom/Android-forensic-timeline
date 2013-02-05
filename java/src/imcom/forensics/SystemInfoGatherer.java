package imcom.forensics;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Enumeration;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.TimeZone;

import android.util.Log;

public class SystemInfoGatherer {
	
	private static final String LOG_TAG = "timeline_forensic";
	private static final int MILLIS_TO_HOURS = 60 * 60 * 1000;
	private String SYSTEM_INFO_FILENAME;
	private static final String CONFIG_SEPARATOR = "=";
	private static final String GATHERER_NAME = "SystemInfo";
	
	public SystemInfoGatherer(String info_filename) {
		this.SYSTEM_INFO_FILENAME = info_filename;
		Log.d(LOG_TAG, GATHERER_NAME + " launches");
	}
	
	public void gather(File dst_dir) throws IOException {
		/* time zone offset */
		BufferedWriter sys_info_writer = new BufferedWriter(
				new FileWriter(
						new File(dst_dir, SYSTEM_INFO_FILENAME)
						)
				);
		
		sys_info_writer.write("[Timezone settings]");
		sys_info_writer.newLine();
		sys_info_writer.write("Phone default timezone" + CONFIG_SEPARATOR + 
				TimeZone.getDefault().getDisplayName()
				);
		sys_info_writer.newLine();
		sys_info_writer.write("Timezone offset(hrs)" + CONFIG_SEPARATOR +
				(TimeZone.getDefault().getOffset(System.currentTimeMillis()) / MILLIS_TO_HOURS)
				);
		sys_info_writer.newLine();
		Log.d(LOG_TAG, GATHERER_NAME + "'s done gathering timezone settings");
		
		/* System environment */
		sys_info_writer.write("[System environment]");
		sys_info_writer.newLine();
		Map<String, String> env_attrs = System.getenv();
		Set<String> attr_names = env_attrs.keySet();
		for (String attr_name : attr_names) {
			sys_info_writer.write(
					attr_name + 
					CONFIG_SEPARATOR + 
					EscapeWrapper.replaceNewLine(
						env_attrs.get(attr_name),
						null
					)
				);
			sys_info_writer.newLine();
		}
		Log.d(LOG_TAG, GATHERER_NAME + "'s done gathering environment variables");
		
		/* System properties */
		sys_info_writer.write("[System properties]");
		sys_info_writer.newLine();
		Properties sys_properties = System.getProperties();
		Enumeration<?> property_names = sys_properties.propertyNames();	
		while (property_names.hasMoreElements()) {
			String property_name = (String) property_names.nextElement();
			sys_info_writer.write(
					property_name + 
					CONFIG_SEPARATOR + 
					EscapeWrapper.replaceNewLine(
						sys_properties.getProperty(property_name),
						null
					)
				);
			sys_info_writer.newLine();
		}
		Log.d(LOG_TAG, GATHERER_NAME + "'s done gathering system properties");
		
		if (sys_info_writer != null) sys_info_writer.close();
	}
}
