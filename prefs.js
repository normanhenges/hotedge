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
        this.settings = this.getSettings();

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

        // edge-size
        let edgeSizeAdjustment = new Gtk.Adjustment({
            lower: 1,
            upper: 100,
            step_increment: 10,
        });
        this.buildSpinRow("edge-size", "Edge Size", "%", positionGroup, edgeSizeAdjustment);

        // primary-monitor-only
        const primaryMonitorOnlyRow = new Adw.SwitchRow({
            title: "Only on Primary Monitor",
        });
        this.settings.bind("primary-monitor-only", primaryMonitorOnlyRow, "active", Gio.SettingsBindFlags.DEFAULT);
        positionGroup.add(primaryMonitorOnlyRow);

        if (this.settings.get_boolean("fallback-in-use")) {
            // fallback-timeout
            let timeoutAdjustment = new Gtk.Adjustment({
                lower: 1,
                upper: 1000,
                step_increment: 50,
            });
            this.buildSpinRow("fallback-timeout", "Activation Timeout", "ms", behaviorGroup, timeoutAdjustment);
        } else {
            // pressure-threshold
            let pressureAdjustment = new Gtk.Adjustment({
                lower: 0,
                upper: 500,
                step_increment: 25,
            });
            this.buildSpinRow("pressure-threshold", "Activation Pressure", "px", behaviorGroup, pressureAdjustment);
        }

        // suppress-activation-when-button-held
        const suppressWhenButtonHeldRow = new Adw.SwitchRow({
            title: "Suppress on Mouse Button",
            subtitle: "Don't activate overview while a mouse button is held",
        });
        this.settings.bind(
            "suppress-activation-when-button-held",
            suppressWhenButtonHeldRow,
            "active",
            Gio.SettingsBindFlags.DEFAULT,
        );
        behaviorGroup.add(suppressWhenButtonHeldRow);

        // suppress-activation-when-fullscreen
        const suppressWhenFullscreenRow = new Adw.SwitchRow({
            title: "Suppress on Fullscreen",
            subtitle: "Don't activate overview while an application is displayed in fullscreen mode",
        });
        this.settings.bind(
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
        this.settings.bind("show-animation", showAnimationRow, "active", Gio.SettingsBindFlags.DEFAULT);
        appearanceGroup.add(showAnimationRow);
    }

    buildSpinRow(preferenceKey, title, unit, group, adjustment) {
        const row = new Adw.ActionRow({
            title: title,
        });
        row.add_css_class("spin");

        const box = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
        });
        row.add_suffix(box);

        const resetButton = new Gtk.Button({
            icon_name: "view-refresh-symbolic",
            tooltip_text: "Reset to default",
            valign: Gtk.Align.CENTER,
            hexpand: false,
            vexpand: false
        });
        resetButton.add_css_class("flat");
        resetButton.connect("clicked", () => {
            this.settings.reset(preferenceKey);
        });
        resetButton.connect("map", () => {
            resetButton.visible =
                this.settings.get_uint(preferenceKey) != this.settings.get_default_value(preferenceKey).get_uint32();
        });
        this.settings.connect("changed::".concat(preferenceKey), () => {
            resetButton.visible =
                this.settings.get_uint(preferenceKey) != this.settings.get_default_value(preferenceKey).get_uint32();
        });

        box.append(resetButton);
        const spinner = new Gtk.SpinButton({
            adjustment: adjustment,
        });
        this.settings.bind(preferenceKey, spinner, "value", Gio.SettingsBindFlags.DEFAULT);
        row.activatable_widget = spinner;
        box.append(spinner);

        const unitLabel = new Gtk.Label({
            label: unit,
            width_chars: "3",
            xalign: 1.0,
            justify: Gtk.Justification.RIGHT,
        });
        box.append(unitLabel);

        group.add(row);
    }
}
