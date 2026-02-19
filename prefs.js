/* prefs.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import Adw from "gi://Adw";

import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class HotEdgePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: "General",
            icon_name: "dialog-information-symbolic",
        });
        window.add(page);

        const positionGroup = new Adw.PreferencesGroup({
            title: "Position",
        });
        page.add(positionGroup);

        const behaviorGroup = new Adw.PreferencesGroup({
            title: "Behavior",
        });
        page.add(behaviorGroup);

        const appearanceGroup = new Adw.PreferencesGroup({
            title: "Appearance",
        });
        page.add(appearanceGroup);

        const edgeSizeRow = new Adw.ActionRow({
            title: "Edge Size",
        });
        edgeSizeRow.add_css_class("spin");
        const edgeSizeBox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
        });
        edgeSizeRow.add_suffix(edgeSizeBox);
        const edgeSizeResetButton = new Gtk.Button({
            icon_name: "view-refresh-symbolic",
            tooltip_text: "Reset to default",
            valign: Gtk.Align.CENTER,
            hexpand: false,
            vexpand: false
        });
        edgeSizeResetButton.add_css_class("flat");
        edgeSizeResetButton.connect("clicked", () => {
            settings.reset("edge-size");
        });
        edgeSizeResetButton.connect("map", () => {
            edgeSizeResetButton.visible = settings.get_uint("edge-size") != settings.get_default_value("edge-size").get_uint32();
        });
        settings.connect("changed::edge-size", () => {
            edgeSizeResetButton.visible = settings.get_uint("edge-size") != settings.get_default_value("edge-size").get_uint32();
        });
        edgeSizeBox.append(edgeSizeResetButton);
        const edgeSizeSpinner = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 100,
                step_increment: 10,
            }),
        });
        settings.bind("edge-size", edgeSizeSpinner, "value", Gio.SettingsBindFlags.DEFAULT);
        edgeSizeRow.activatable_widget = edgeSizeSpinner;
        edgeSizeBox.append(edgeSizeSpinner);
        const edgeSizeUnit = new Gtk.Label({
            label: " %",
            width_chars: "3",
            xalign: 1.0,
            justify: Gtk.Justification.RIGHT,
        });
        edgeSizeBox.append(edgeSizeUnit);
        positionGroup.add(edgeSizeRow);

        // primary-monitor-only
        const primaryMonitorOnlyRow = new Adw.SwitchRow({
            title: "Only on Primary Monitor",
        });
        settings.bind("primary-monitor-only", primaryMonitorOnlyRow, "active", Gio.SettingsBindFlags.DEFAULT);
        positionGroup.add(primaryMonitorOnlyRow);

        if (settings.get_boolean("fallback-in-use")) {
            // fallback-timeout
            const timeoutRow = new Adw.ActionRow({
                title: "Activation Timeout",
            });
            timeoutRow.add_css_class("spin");
            const timeoutBox = new Gtk.Box({
                orientation: Gtk.Orientation.HORIZONTAL,
            });
            timeoutRow.add_suffix(timeoutBox);
            const timeoutSpinner = new Gtk.SpinButton({
                adjustment: new Gtk.Adjustment({
                    lower: 0,
                    upper: 1000,
                    step_increment: 50,
                }),
            });
            settings.bind("fallback-timeout", timeoutSpinner, "value", Gio.SettingsBindFlags.DEFAULT);
            timeoutRow.activatable_widget = timeoutSpinner;
            timeoutBox.append(timeoutSpinner);
            const timeoutUnit = new Gtk.Label({
                label: " ms",
                width_chars: "3",
                xalign: 1.0,
                justify: Gtk.Justification.RIGHT,
            });
            timeoutBox.append(timeoutUnit);
            behaviorGroup.add(timeoutRow);
        } else {
            // pressure-threshold
            const pressureRow = new Adw.ActionRow({
                title: "Activation Pressure",
            });
            pressureRow.add_css_class("spin");
            const pressureBox = new Gtk.Box({
                orientation: Gtk.Orientation.HORIZONTAL,
            });
            pressureRow.add_suffix(pressureBox);
            const pressureSpinner = new Gtk.SpinButton({
                adjustment: new Gtk.Adjustment({
                    lower: 0,
                    upper: 500,
                    step_increment: 25,
                }),
            });
            settings.bind("pressure-threshold", pressureSpinner, "value", Gio.SettingsBindFlags.DEFAULT);
            pressureRow.activatable_widget = pressureSpinner;
            pressureBox.append(pressureSpinner);
            const pressureUnit = new Gtk.Label({
                label: " px",
                width_chars: "3",
                xalign: 1.0,
                justify: Gtk.Justification.RIGHT,
            });
            pressureBox.append(pressureUnit);
            behaviorGroup.add(pressureRow);
        }

        // suppress-activation-when-button-held
        const suppressWhenButtonHeldRow = new Adw.ExpanderRow({
            title: "Suppress on Mouse Button",
            subtitle: "Don't activate overview while a mouse button is held",
            show_enable_switch: true,
        });
        settings.bind(
            "suppress-activation-when-button-held",
            suppressWhenButtonHeldRow,
            "enable-expansion",
            Gio.SettingsBindFlags.DEFAULT,
        );
        behaviorGroup.add(suppressWhenButtonHeldRow);

        // suppress-button-option-left
        const suppressButtonOptionLeft = new Adw.SwitchRow({
            title: "Left Mouse Button",
        });
        settings.bind(
            "suppress-button-option-left",
            suppressButtonOptionLeft,
            "active",
            Gio.SettingsBindFlags.DEFAULT,
        );
        suppressWhenButtonHeldRow.add_row(suppressButtonOptionLeft);

        // suppress-button-option-right
        const suppressButtonOptionRight = new Adw.SwitchRow({
            title: "Right Mouse Button",
        });
        settings.bind(
            "suppress-button-option-right",
            suppressButtonOptionRight,
            "active",
            Gio.SettingsBindFlags.DEFAULT,
        );
        suppressWhenButtonHeldRow.add_row(suppressButtonOptionRight);

        // suppress-button-option-middle
        const suppressButtonOptionMiddle = new Adw.SwitchRow({
            title: "Middle Mouse Button",
        });
        settings.bind(
            "suppress-button-option-middle",
            suppressButtonOptionMiddle,
            "active",
            Gio.SettingsBindFlags.DEFAULT,
        );
        suppressWhenButtonHeldRow.add_row(suppressButtonOptionMiddle);

        // suppress-activation-when-fullscreen
        const suppressWhenFullscreenRow = new Adw.SwitchRow({
            title: "Suppress on Fullscreen",
            subtitle: "Don't activate overview while an application is displayed in fullscreen mode",
        });
        settings.bind(
            "suppress-activation-when-fullscreen",
            suppressWhenFullscreenRow,
            "active",
            Gio.SettingsBindFlags.DEFAULT,
        );
        behaviorGroup.add(suppressWhenFullscreenRow);

        // show-animation
        const showAnimationRow = new Adw.SwitchRow({
            title: "Show Animation when Activated",
        });
        settings.bind("show-animation", showAnimationRow, "active", Gio.SettingsBindFlags.DEFAULT);
        appearanceGroup.add(showAnimationRow);
    }
}
