/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2025 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
export default [
  ['core_connections_connections_settings_group', 'Connexions'],
  ['connections_administration_item', 'Modèles de connexion'],
  ['connections_administration_connection_create', 'Ajouter un modèle de base de données'],
  [
    'connections_administration_search_database_tip',
    "Saisissez vos hôtes ici, par exemple 'localhost host1.myhost.com 192.168.0.1' et appuyez sur Entrée",
  ],
  ['connections_administration_new_connection', 'Nouvelle connexion'],
  ['connections_administration_connection_create_error', 'Erreur de création de connexion'],
  ['connections_administration_connection_save_error', 'Erreur de sauvegarde de connexion'],
  ['connections_administration_connection_access_empty', 'Aucun utilisateur et équipe disponibles'],
  ['connections_administration_configuration_wizard_step_title', 'Connexions de base de données'],
  ['connections_administration_configuration_wizard_step_description', 'Ajouter des connexions de base de données'],
  ['connections_administration_configuration_wizard_title', 'Ajouter des connexions de base de données'],
  [
    'connections_administration_configuration_wizard_message',
    'Ici, vous pouvez créer des connexions de base de données manuellement ou en utilisant une recherche de serveur de base de données.\nVous pouvez passer cette étape et configurer les connexions plus tard.',
  ],
  ['connections_administration_connection_no_information', 'Aucune information disponible'],
  ['connections_administration_delete_confirmation', 'Vous allez supprimer ces connexions : '],
  ['connections_administration_tools_add_tooltip', 'Ajouter un nouveau modèle'],
  ['connections_administration_tools_refresh_tooltip', 'Actualiser la liste des connexions'],
  ['connections_administration_tools_delete_tooltip', 'Supprimer les connexions sélectionnées'],
  ['connections_administration_tools_refresh_success', 'La liste des connexions a été actualisée'],
  ['connections_administration_tools_refresh_fail', "Échec de l'actualisation de la liste des connexions"],
  ['connections_database_authentication', 'Authentification de la base de données'],
  ['connections_connection_edit_not_own_deny', "Vous n'avez pas accès pour modifier cette connexion."],
  ['connections_connection_connect', 'Connecter'],
  ['connections_connection_create_custom', 'Personnalisé'],
  ['connections_connection_create_search_database', 'Recherche'],
  ['connections_connection_authentication_save_credentials_for_user', 'Save credentials for the current user'],
  ['connections_connection_authentication_save_credentials_for_user_tooltip', 'These credentials will be used to make automatic connection'],
  ['connections_connection_authentication_save_credentials_for_session', 'Don’t ask again during the session'],
  ['connections_connection_authentication_save_credentials_for_session_tooltip', 'These credentials will be removed after logout'],
  ['connections_connection_edit_save_credentials_shared', 'Save credentials for all users with access'],
  [
    'connections_connection_edit_save_credentials_shared_tooltip',
    'These credentials will be used to make automatic connection for all users having access',
  ],
  ['connections_connection_share_credentials', 'Share credentials with teammates'],
  ['connections_connection_share_credentials_tooltip', 'These credentials will be used to make automatic connection for all users in a team'],
  ['connections_connection_credentials_provisioning', "Identifiants d'authentification"],
  ['connections_connection_credentials_provisioning_description', 'Vous devez remplir ou confirmer les identifiants pour tester cette connexion'],
  ['connections_connection_edit_authentication', 'Authentification'],
  ['connections_connection_edit_access', 'Accès'],
  ['connections_connection_edit_access_load_failed', "Échec de l'obtention de l'accès à la connexion"],
  ['connections_connection_edit_access_team', 'Équipe'],
  ['connections_connection_edit_search', 'Rechercher'],
  ['connections_connection_edit_search_hosts', 'Noms des hôtes'],
  ['connections_connection_address', 'Adresse'],
  ['connections_connection_folder', 'Dossier'],
  [
    'connections_connection_folder_validation',
    'Le nom du dossier ne peut pas contenir les symboles suivants / : " \\ \' <> | ? * et ne peut pas commencer par un point',
  ],
  ['connections_connection_name', 'Nom de la connexion'],
  ['connections_connection_access_user_or_team_name', "Nom de l'utilisateur ou de l'équipe"],
  ['connections_connection_access_filter_placeholder', "Rechercher un nom d'utilisateur ou d'équipe"],
  [
    'connections_connection_access_admin_info',
    "Les administrateurs voient toutes les connexions à l'exception des connexions privées des autres utilisateurs.",
  ],
  ['connections_connection_description', 'Description'],
  ['connections_connection_project', 'Projet'],
  ['connections_connection_driver', 'Pilote'],
  ['connections_connection_configuration', 'Configuration'],
  ['connections_connection_host', 'Hôte'],
  ['connections_connection_port', 'Port'],
  ['connections_connection_read_only', 'Read-only connection'],
  ['connections_connection_template', 'Modèle'],
  ['connections_connection_test', 'Tester'],
  ['connections_connection_test_tooltip', 'Tester la connexion'],
  ['connections_connection_test_fail', 'Échec du test de connexion'],
  ['connections_connection_create_fail', 'Échec de la création de la connexion'],
  ['connections_connection_save_fail', 'Échec de la sauvegarde de la connexion'],
  ['connections_connection_expert_settings', 'Expert settings'],
  ['connections_connection_keep_alive', 'Garder actif (en secondes)'],
  ['connections_connection_autocommit', 'Auto commit'],
  ['connections_connection_keep_alive_tooltip', 'Pas de déconnexion automatique'],
  ['connections_network_handler_test', 'Tester le tunnel'],
  ['connections_network_handler_test_fail', 'Échec du test du tunnel'],
  ['connections_network_handler_test_success', 'Test du tunnel réussi'],
  ['connections_network_handler_default_title', 'Gestionnaire de réseau'],
  ['connections_network_handler_default_user', 'Utilisateur'],
  ['connections_network_handler_default_password', 'Mot de passe'],
  ['connections_network_handler_ssh_tunnel_title', 'Tunnel SSH'],
  ['connections_network_handler_ssh_tunnel_enable', 'Utiliser le tunnel SSH'],
  ['connections_network_handler_ssh_tunnel_host', 'Hôte'],
  ['connections_network_handler_ssh_tunnel_port', 'Port'],
  ['connections_network_handler_ssh_tunnel_user', 'Utilisateur'],
  ['connections_network_handler_ssh_tunnel_password', 'Mot de passe'],
  ['connections_network_handler_ssh_tunnel_auth_type', "Méthode d'authentification"],
  ['connections_network_handler_ssh_tunnel_private_key', 'Clé privée'],
  ['connections_network_handler_ssh_tunnel_advanced_settings', 'Paramètres avancés'],
  ['connections_network_handler_ssh_tunnel_advanced_settings_alive_interval', 'Intervalle de maintien en vie (ms)'],
  ['connections_network_handler_ssh_tunnel_advanced_settings_connect_timeout', 'Délai de connexion (ms)'],
  ['connections_driver_search_placeholder', 'Saisir le nom du pilote...'],
  ['connections_not_found', 'Aucune connexion de base de données trouvée'],

  [
    'cloud_connections_access_placeholder',
    'Les connexions cloud sont visibles par tous les utilisateurs. La gestion des accès peut être configurée dans la "AWS Management Console".',
  ],

  ['core_connections_settings_disable', 'Disable'],
  ['core_connections_settings_disable_description', 'Disable the ability to create new connections'],
  ['connections_templates_deprecated_message', 'Template connections are deprecated and will be removed in future releases'],
  ['core_connections_connection_driver_not_installed', 'Driver is not installed'],
  ['core_connections_connection_temporary', 'Temporary connection'],
];
