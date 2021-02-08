/*
 * DBeaver - Universal Database Manager
 * Copyright (C) 2010-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.cloudbeaver.registry;

import io.cloudbeaver.WebServiceUtils;
import io.cloudbeaver.server.CBApplication;
import org.eclipse.core.runtime.IConfigurationElement;
import org.eclipse.core.runtime.IExtensionRegistry;
import org.eclipse.core.runtime.Platform;
import org.jkiss.dbeaver.Log;
import org.jkiss.dbeaver.model.connection.DBPDriver;
import org.jkiss.utils.ArrayUtils;

import java.util.HashSet;
import java.util.Set;

public class WebDriverRegistry {

    private static final Log log = Log.getLog(WebDriverRegistry.class);

    private static final String EXTENSION_ID = "io.cloudbeaver.driver"; //$NON-NLS-1$
    private static final String TAG_DRIVER = "driver"; //$NON-NLS-1$

    private static WebDriverRegistry instance = null;

    public synchronized static WebDriverRegistry getInstance() {
        if (instance == null) {
            instance = new WebDriverRegistry();
            instance.loadExtensions(Platform.getExtensionRegistry());
        }
        return instance;
    }

    private final Set<String> webDrivers = new HashSet<>();

    private WebDriverRegistry() {
    }

    private void loadExtensions(IExtensionRegistry registry) {
        {
            IConfigurationElement[] extConfigs = registry.getConfigurationElementsFor(EXTENSION_ID);
            for (IConfigurationElement ext : extConfigs) {
                // Load webServices
                if (TAG_DRIVER.equals(ext.getName())) {
                    this.webDrivers.add(ext.getAttribute("id"));
                }
            }
        }
    }

    public boolean isDriverEnabled(DBPDriver driver) {
        String driverId = WebServiceUtils.makeDriverFullId(driver);
        if (webDrivers.contains(driverId)) {
            String[] enabledDrivers = CBApplication.getInstance().getAppConfiguration().getEnabledDrivers();
            if (enabledDrivers.length > 0 && !ArrayUtils.contains(enabledDrivers, driverId)) {
                return false;
            }
            String[] disabledDrivers = CBApplication.getInstance().getAppConfiguration().getDisabledDrivers();
            if (disabledDrivers.length > 0 && ArrayUtils.contains(disabledDrivers, driverId)) {
                return false;
            }
            return true;
        }
        return false;
    }

}
