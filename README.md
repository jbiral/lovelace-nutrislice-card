# Nutrislice Card

A Home Assistant Lovelace card to display school lunch menus from the Nutrislice integration.

## Installation

This card is best installed via [HACS](https://hacs.xyz/).

1. Open HACS in Home Assistant.
2. Go to **Frontend**.
3. Click the three dots in the top right and select **Custom repositories**.
4. Add the URL of this repository and select **Lovelace** as the category.
5. Search for "Nutrislice Card" and install it.

## Configuration

Add the following to your dashboard:

```yaml
type: custom:nutrislice-card
entity: sensor.nutrislice_menu_your_school
title: 'School Menu'
categories:
  - entree
  - sides
```
